import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

from api import decision, profile, memory, voice
from services import qdrant_service, embeddings

app = FastAPI(
    title="Courtroom Mode API",
    description="Multi-Agent Life-Decision Debate Engine (Omi + Qdrant + Lyzr)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    vector_size = embeddings.get_vector_size()
    qdrant_service.ensure_collection(vector_size=vector_size)

app.include_router(decision.router, prefix="/api/v1", tags=["Decision"])
app.include_router(profile.router, prefix="/api/v1", tags=["Profile"])
app.include_router(memory.router, prefix="/api/v1", tags=["Memory"])
app.include_router(voice.router, prefix="/api/v1", tags=["Voice"])

@app.get("/api/v1/health", tags=["Health"])
def health():
    mem_count = qdrant_service.count_memories()
    return {
        "status": "healthy",
        "system": "Courtroom Mode Backend",
        "memories_synced": mem_count,
        "embedding_provider": os.getenv("EMBEDDING_PROVIDER", "sentence-transformers"),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
