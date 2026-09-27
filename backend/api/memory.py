from fastapi import APIRouter, Query, Body
from datetime import datetime
from typing import Optional
from models.schemas import MemorySearchResponse
from services import qdrant_service, embeddings

router = APIRouter()

@router.get("/memory/search", response_model=MemorySearchResponse)
async def search_memory(q: str = Query(..., description="Query text to search for"), top_k: int = Query(5, ge=1, le=20)):
    results = qdrant_service.search_memories(query=q, embed_fn=embeddings.embed_text, top_k=top_k)
    return MemorySearchResponse(
        query=q,
        count=len(results),
        results=results,
    )

@router.get("/memory/list")
async def list_memories(limit: int = Query(50, ge=1, le=100)):
    memories = qdrant_service.get_all_memories(limit=limit)
    total_count = qdrant_service.count_memories()
    return {
        "total": total_count,
        "returned": len(memories),
        "memories": memories,
    }

@router.post("/memory/add")
async def add_memory(
    text: str = Body(..., embed=True),
    mem_type: str = Body("value", embed=True),
    source: str = Body("manual", embed=True),
):
    point_id = qdrant_service.upsert_memory(
        text=text,
        mem_type=mem_type,
        source=source,
        embed_fn=embeddings.embed_text,
        timestamp=datetime.utcnow().isoformat(),
    )
    return {"status": "ok", "point_id": point_id}
