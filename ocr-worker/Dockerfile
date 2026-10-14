FROM python:3.12-slim

# System deps: Tesseract 5 (eng + ara), pdftoppm (poppler), OpenCV headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-ara \
    poppler-utils \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py pipeline.py ./

ENV PYTHONUNBUFFERED=1

EXPOSE 8080

CMD ["python", "main.py"]
