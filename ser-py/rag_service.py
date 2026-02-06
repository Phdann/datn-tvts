import os
import time
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import chromadb
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
import uvicorn

load_dotenv()
app = FastAPI()

keys_env = os.getenv("GEMINI_KEYS")
if not keys_env:
    raise ValueError("CHƯA CẤU HÌNH KEY! tạo file .env và thêm biến GEMINI_KEYS.")

API_KEYS = [k.strip() for k in keys_env.split(',') if k.strip()]

current_key_index = 0

def get_current_api_key():
    global current_key_index
    return API_KEYS[current_key_index]

def rotate_key():
    global current_key_index
    old_index = current_key_index
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    print(f"Key tại index {old_index} bị lỗi. Đang đổi sang Key index {current_key_index}...")

def get_embedding_model():
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001", 
        google_api_key=get_current_api_key() 
    )

async def execute_with_retry(func_type, text_data):
    for _ in range(len(API_KEYS)):
        try:
            embeddings = get_embedding_model()
            
            if func_type == 'documents':
                return embeddings.embed_documents(text_data)
            elif func_type == 'query':
                return embeddings.embed_query(text_data)
                
        except Exception as e:
            print(f"Lỗi với Key: {get_current_api_key()[:10]}... -> {str(e)}")
            rotate_key()
            time.sleep(0.5)
            
    raise HTTPException(status_code=500, detail="Tất cả API Key đều đã hết hạn mức hoặc bị lỗi.")






# Khởi tạo Vector DB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="university_info")

class QueryRequest(BaseModel):
    question: str
    n_results: int = 3

class TextIngestRequest(BaseModel):
    content: str
    source: str 

@app.post("/ingest-text")
async def ingest_text(request: TextIngestRequest):
    try:
        # 1. Chia nhỏ văn bản
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        docs = text_splitter.create_documents([request.content])
        
        # 2. Chuẩn bị dữ liệu
        ids = [f"{request.source}_{i}" for i in range(len(docs))]
        documents = [doc.page_content for doc in docs]
        metadatas = [{"source": request.source} for _ in docs]
        
        # 3. Embedding văn bản
        # Truyền vào 'documents' và list văn bản
        doc_embeddings = await execute_with_retry('documents', documents)

        # 4. Lưu vào ChromaDB
        collection.add(
            ids=ids,
            embeddings=doc_embeddings,
            documents=documents,
            metadatas=metadatas
        )
        return {"status": "success", "chunks_added": len(docs)}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search(request: QueryRequest):
    try:
        # 1. Embed câu hỏi
        # Truyền vào 'query' và câu hỏi
        query_embedding = await execute_with_retry('query', request.question)
        
        # 2. Truy vấn Vector DB
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=request.n_results
        )
        
        # 3. Trả về context
        context_list = []
        if results['documents'] and len(results['documents'][0]) > 0:
            context_list = results['documents'][0]
            
        return {"context": context_list}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

class DeleteRequest(BaseModel):
    source: str

@app.post("/delete-doc")
async def delete_doc(request: DeleteRequest):
    try:
        # Xóa tất cả vector có metadata 'source' trùng với source gửi lên
        collection.delete(where={"source": request.source})
        return {"status": "success", "message": f"Deleted docs for source: {request.source}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print(f"Đang khởi chạy với {len(API_KEYS)} API Keys...")
    uvicorn.run(app, host="0.0.0.0", port=8000)