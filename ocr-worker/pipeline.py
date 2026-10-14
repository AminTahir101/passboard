"""
OCR pipeline: PDF/image/DOCX → structured lab values

Flow per page:
  1. pdf2image (300 DPI) or direct image load
  2. OpenCV: greyscale → denoise → deskew → binarise
  3. Tesseract 5 (eng+ara) → per-word confidence
  4. If page confidence < 80 % or table/handwriting detected → GPT-4o vision
  5. GPT-4o structured-output → list[ExtractedValue]
"""

from __future__ import annotations

import base64
import io
import json
import logging
import math
import os
import tempfile
from dataclasses import dataclass, field
from typing import Optional

import cv2
import numpy as np
import pytesseract
from openai import OpenAI
from pdf2image import convert_from_bytes
from PIL import Image

try:
    from docx import Document as DocxDocument
    DOCX_OK = True
except ImportError:
    DOCX_OK = False

log = logging.getLogger(__name__)

_openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

CONFIDENCE_THRESHOLD = 80   # fall back to GPT-4o below this
MAX_PAGES = 30              # guard against huge PDFs


@dataclass
class ExtractedValue:
    name: str
    value: str
    unit: str = ""
    ref_range: str = ""
    flag: str = ""          # H / L / HH / LL / ""
    observed_at: str = ""   # ISO date or ""
    loinc: str = ""
    confidence: float = 0.0
    page: int = 1


# ── Pre-processing ────────────────────────────────────────────────────────────

def _to_greyscale(img: np.ndarray) -> np.ndarray:
    if len(img.shape) == 3:
        return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img


def _denoise(img: np.ndarray) -> np.ndarray:
    return cv2.fastNlMeansDenoising(img, h=10, templateWindowSize=7, searchWindowSize=21)


def _deskew(img: np.ndarray) -> np.ndarray:
    """Rotate image to correct skew using Hough line transform."""
    edges = cv2.Canny(img, 50, 150, apertureSize=3)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, threshold=100)
    if lines is None:
        return img

    angles: list[float] = []
    for line in lines[:20]:
        rho, theta = line[0]
        angle = math.degrees(theta) - 90
        if abs(angle) < 45:
            angles.append(angle)

    if not angles:
        return img

    median_angle = float(np.median(angles))
    if abs(median_angle) < 0.5:
        return img

    h, w = img.shape[:2]
    centre = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(centre, median_angle, 1.0)
    return cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_REPLICATE)


def _binarise(img: np.ndarray) -> np.ndarray:
    return cv2.adaptiveThreshold(
        img, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=31,
        C=10,
    )


def preprocess(pil_image: Image.Image) -> np.ndarray:
    img = np.array(pil_image)
    img = _to_greyscale(img)
    img = _denoise(img)
    img = _deskew(img)
    img = _binarise(img)
    return img


# ── Tesseract ─────────────────────────────────────────────────────────────────

def _tesseract_confidence(img: np.ndarray) -> float:
    """Return mean word confidence (0–100) for the page."""
    data = pytesseract.image_to_data(
        img,
        lang="eng+ara",
        config="--psm 6",
        output_type=pytesseract.Output.DICT,
    )
    confs = [int(c) for c in data["conf"] if str(c).lstrip("-").isdigit() and int(c) >= 0]
    return float(np.mean(confs)) if confs else 0.0


def _has_table_or_handwriting(img: np.ndarray) -> bool:
    """Heuristic: many horizontal lines → likely a printed table."""
    edges = cv2.Canny(img, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80,
                            minLineLength=img.shape[1] // 4, maxLineGap=10)
    return lines is not None and len(lines) > 8


# ── GPT-4o vision fallback ────────────────────────────────────────────────────

_PARSE_SYSTEM = """You are a medical document parser. Extract every lab/investigation result from the page image.

For each result return:
- name: test name (e.g. "Haemoglobin", "WBC")
- value: numeric or text result
- unit: unit of measure (e.g. "g/dL", "×10⁹/L") or ""
- ref_range: reference range as a string (e.g. "13.5–17.5") or ""
- flag: "H", "L", "HH", "LL", or "" (high/low flags)
- observed_at: ISO date (YYYY-MM-DD) if visible, else ""
- loinc: LOINC code if you know it with high certainty, else ""

Return ONLY a JSON array. If the page contains no lab results, return [].
Do not include normal prose. Do not invent values."""

_PARSE_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "name":        {"type": "string"},
            "value":       {"type": "string"},
            "unit":        {"type": "string"},
            "ref_range":   {"type": "string"},
            "flag":        {"type": "string", "enum": ["H", "L", "HH", "LL", ""]},
            "observed_at": {"type": "string"},
            "loinc":       {"type": "string"},
        },
        "required": ["name", "value", "unit", "ref_range", "flag", "observed_at", "loinc"],
        "additionalProperties": False,
    },
}


def _pil_to_b64(pil_image: Image.Image) -> str:
    buf = io.BytesIO()
    pil_image.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def _gpt4o_extract(pil_image: Image.Image, page: int) -> list[ExtractedValue]:
    b64 = _pil_to_b64(pil_image)
    try:
        resp = _openai.chat.completions.create(
            model="gpt-4o",
            temperature=0.0,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "lab_values",
                    "strict": True,
                    "schema": _PARSE_SCHEMA,
                },
            },
            messages=[
                {"role": "system", "content": _PARSE_SYSTEM},
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}", "detail": "high"}},
                        {"type": "text", "text": "Extract all lab values from this page."},
                    ],
                },
            ],
        )
        rows: list[dict] = json.loads(resp.choices[0].message.content or "[]")
    except Exception as exc:
        log.warning("GPT-4o extraction failed on page %d: %s", page, exc)
        return []

    return [
        ExtractedValue(
            name=r["name"],
            value=r["value"],
            unit=r.get("unit", ""),
            ref_range=r.get("ref_range", ""),
            flag=r.get("flag", ""),
            observed_at=r.get("observed_at", ""),
            loinc=r.get("loinc", ""),
            confidence=0.85,   # GPT-4o extraction; no per-token confidence
            page=page,
        )
        for r in rows if r.get("name") and r.get("value")
    ]


# ── Per-page processing ───────────────────────────────────────────────────────

def process_page(pil_image: Image.Image, page: int) -> list[ExtractedValue]:
    processed = preprocess(pil_image)
    confidence = _tesseract_confidence(processed)
    use_gpt = confidence < CONFIDENCE_THRESHOLD or _has_table_or_handwriting(processed)

    log.info("Page %d — Tesseract confidence %.1f%% — using %s",
             page, confidence, "GPT-4o" if use_gpt else "Tesseract")

    if use_gpt:
        return _gpt4o_extract(pil_image, page)

    # Tesseract path: re-run for text, then parse with GPT-4o text-only
    raw_text = pytesseract.image_to_string(processed, lang="eng+ara", config="--psm 6")
    return _parse_text_with_gpt(raw_text, confidence, page)


def _parse_text_with_gpt(raw_text: str, confidence: float, page: int) -> list[ExtractedValue]:
    """Use GPT-4o (text only) to parse Tesseract output into structured values."""
    if not raw_text.strip():
        return []
    try:
        resp = _openai.chat.completions.create(
            model="gpt-4o",
            temperature=0.0,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "lab_values",
                    "strict": True,
                    "schema": _PARSE_SCHEMA,
                },
            },
            messages=[
                {"role": "system", "content": _PARSE_SYSTEM},
                {"role": "user", "content": f"OCR text from a lab report page:\n\n{raw_text}"},
            ],
        )
        rows: list[dict] = json.loads(resp.choices[0].message.content or "[]")
    except Exception as exc:
        log.warning("Text-parse GPT call failed: %s", exc)
        return []

    return [
        ExtractedValue(
            name=r["name"],
            value=r["value"],
            unit=r.get("unit", ""),
            ref_range=r.get("ref_range", ""),
            flag=r.get("flag", ""),
            observed_at=r.get("observed_at", ""),
            loinc=r.get("loinc", ""),
            confidence=round(confidence / 100, 2),
            page=page,
        )
        for r in rows if r.get("name") and r.get("value")
    ]


# ── Document-level entry point ────────────────────────────────────────────────

def process_document(file_bytes: bytes, mime_type: str) -> list[ExtractedValue]:
    """
    Convert document → pages → run OCR pipeline → return structured values.
    Supported: PDF, JPEG/PNG/WEBP/HEIC (image), DOCX.
    """
    pages: list[Image.Image] = []

    if mime_type == "application/pdf":
        pil_pages = convert_from_bytes(file_bytes, dpi=300)
        pages = pil_pages[:MAX_PAGES]

    elif mime_type in ("image/jpeg", "image/png", "image/webp", "image/heic"):
        pages = [Image.open(io.BytesIO(file_bytes)).convert("RGB")]

    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        if not DOCX_OK:
            log.warning("python-docx not installed; skipping DOCX")
            return []
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as f:
            f.write(file_bytes)
            f.flush()
            doc = DocxDocument(f.name)
        text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        return _parse_text_with_gpt(text, confidence=90.0, page=1)

    else:
        log.warning("Unsupported MIME type: %s", mime_type)
        return []

    results: list[ExtractedValue] = []
    for i, page_img in enumerate(pages, start=1):
        try:
            results.extend(process_page(page_img, i))
        except Exception as exc:
            log.error("Page %d failed: %s", i, exc)

    return results
