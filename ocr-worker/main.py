"""
OCR worker — FastAPI app.

Polls Supabase for pending case_jobs, runs the OCR pipeline on each
document, writes extracted values back to case_extracted_values, and
updates the job status.

Job lifecycle: pending → processing → done | failed (max 3 attempts).
Timeout per document: 120 s.
"""

from __future__ import annotations

import asyncio
import logging
import os
import signal
import sys
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from fastapi import FastAPI
from supabase import create_client, Client

from pipeline import process_document, ExtractedValue

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
log = logging.getLogger(__name__)

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]
POLL_INTERVAL: int = int(os.environ.get("POLL_INTERVAL_SECONDS", "5"))
MAX_ATTEMPTS: int = 3
JOB_TIMEOUT: int = 120   # seconds per document

_shutdown = asyncio.Event()


def _supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ── Job processing ────────────────────────────────────────────────────────────

async def _download_document(storage_path: str) -> tuple[bytes, str]:
    """Download a file from the case-media bucket using a short-lived signed URL."""
    sb = _supabase()
    result = sb.storage.from_("case-media").create_signed_url(storage_path, 300)
    signed_url: str = result["signedURL"]

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.get(signed_url)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "application/octet-stream").split(";")[0].strip()
        return resp.content, content_type


def _write_extracted_values(
    sb: Client,
    document_id: str,
    values: list[ExtractedValue],
) -> None:
    if not values:
        return
    rows = [
        {
            "document_id": document_id,
            "name": v.name,
            "value": v.value,
            "unit": v.unit or None,
            "ref_range": v.ref_range or None,
            "flag": v.flag or None,
            "observed_at": v.observed_at or None,
            "loinc": v.loinc or None,
            "confidence": v.confidence,
            "page": v.page,
        }
        for v in values
    ]
    sb.table("case_extracted_values").insert(rows).execute()
    log.info("Wrote %d extracted values for document %s", len(rows), document_id)


async def process_job(job: dict) -> None:
    job_id: str = job["id"]
    document_id: Optional[str] = job.get("document_id")
    case_id: str = job["case_id"]
    attempts: int = job.get("attempts", 0) + 1

    sb = _supabase()

    # Mark processing
    sb.table("case_jobs").update({
        "status": "processing",
        "attempts": attempts,
    }).eq("id", job_id).execute()

    log.info("Processing job %s (attempt %d) document=%s", job_id, attempts, document_id)

    try:
        if not document_id:
            raise ValueError("job has no document_id")

        # Get the storage path
        doc_result = sb.table("case_documents").select("storage_path, doc_type").eq("id", document_id).single().execute()
        doc = doc_result.data
        if not doc:
            raise ValueError(f"document {document_id} not found")

        storage_path: str = doc["storage_path"]
        mime_type: str = doc.get("doc_type") or "application/octet-stream"

        # Download + OCR (with timeout)
        file_bytes, detected_mime = await asyncio.wait_for(
            _download_document(storage_path),
            timeout=JOB_TIMEOUT,
        )

        # Use detected MIME if the stored doc_type is generic
        effective_mime = detected_mime if mime_type == "application/octet-stream" else mime_type

        values = await asyncio.get_event_loop().run_in_executor(
            None,
            process_document,
            file_bytes,
            effective_mime,
        )

        # Persist results
        _write_extracted_values(sb, document_id, values)

        # Update document OCR metadata
        sb.table("case_documents").update({
            "ocr_engine": "tesseract+gpt4o",
            "ocr_confidence": round(
                sum(v.confidence for v in values) / len(values) * 100, 1
            ) if values else None,
        }).eq("id", document_id).execute()

        # Mark job done
        sb.table("case_jobs").update({"status": "done"}).eq("id", job_id).execute()
        log.info("Job %s done — %d values extracted", job_id, len(values))

        # Check if all jobs for this case are done → update case status
        _maybe_advance_case(sb, case_id)

    except Exception as exc:
        log.error("Job %s failed (attempt %d): %s", job_id, attempts, exc, exc_info=True)
        if attempts >= MAX_ATTEMPTS:
            sb.table("case_jobs").update({"status": "failed", "error": str(exc)}).eq("id", job_id).execute()
            log.warning("Job %s permanently failed after %d attempts", job_id, attempts)
        else:
            # Reset to pending for retry
            sb.table("case_jobs").update({
                "status": "pending",
                "attempts": attempts,
                "error": str(exc),
            }).eq("id", job_id).execute()


def _maybe_advance_case(sb: Client, case_id: str) -> None:
    """If all jobs for this case are done, set case status to ocr_done."""
    result = sb.table("case_jobs").select("status").eq("case_id", case_id).execute()
    jobs = result.data or []
    if jobs and all(j["status"] == "done" for j in jobs):
        sb.table("cases").update({"status": "ocr_done"}).eq("id", case_id).execute()
        log.info("All OCR jobs done for case %s — status → ocr_done", case_id)


# ── Poll loop ─────────────────────────────────────────────────────────────────

async def poll_loop() -> None:
    log.info("OCR worker started — polling every %ds", POLL_INTERVAL)
    sb = _supabase()

    while not _shutdown.is_set():
        try:
            result = (
                sb.table("case_jobs")
                .select("*")
                .eq("status", "pending")
                .lt("attempts", MAX_ATTEMPTS)
                .order("created_at")
                .limit(5)
                .execute()
            )
            jobs: list[dict] = result.data or []

            if jobs:
                log.info("Found %d pending job(s)", len(jobs))
                await asyncio.gather(*[process_job(j) for j in jobs])

        except Exception as exc:
            log.error("Poll loop error: %s", exc, exc_info=True)

        try:
            await asyncio.wait_for(_shutdown.wait(), timeout=POLL_INTERVAL)
        except asyncio.TimeoutError:
            pass


# ── FastAPI app ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    loop_task = asyncio.create_task(poll_loop())

    def _handle_signal(*_):
        log.info("Shutdown signal received")
        _shutdown.set()

    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, _handle_signal)

    yield

    _shutdown.set()
    loop_task.cancel()
    try:
        await loop_task
    except asyncio.CancelledError:
        pass
    log.info("Worker stopped")


app = FastAPI(title="Passboard OCR Worker", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/jobs/{job_id}/retry")
async def retry_job(job_id: str):
    """Manually requeue a failed job."""
    sb = _supabase()
    sb.table("case_jobs").update({"status": "pending", "attempts": 0, "error": None}).eq("id", job_id).execute()
    return {"queued": job_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, log_level="info")
