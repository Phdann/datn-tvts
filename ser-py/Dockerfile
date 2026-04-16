FROM python:3.9-slim

WORKDIR /app

# Cài đặt các thư viện hệ thống cần thiết cho Chromadb
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code
COPY . .

# Tạo thư mục chứa database nếu chưa có
RUN mkdir -p chroma_db

# Chạy service bằng uvicorn
# Hugging Face Spaces mặc định chạy cổng 7860
CMD ["uvicorn", "rag_service:app", "--host", "0.0.0.0", "--port", "7860"]
