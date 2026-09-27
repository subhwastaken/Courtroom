from fastapi import APIRouter, HTTPException, Body
from datetime import datetime
from models.schemas import OutcomeRequest, ProfileResponse
from services import profile_service, qdrant_service, embeddings

router = APIRouter()

@router.get("/profile", response_model=ProfileResponse)
async def get_profile():
    raw_md = profile_service.load_profile()
    sections = profile_service.parse_sections(raw_md)
    count = qdrant_service.count_memories()
    return ProfileResponse(
        raw_markdown=raw_md,
        sections=sections,
        memory_count=count,
    )

@router.post("/profile/outcome")
async def log_outcome(req: OutcomeRequest):
    if not req.question or not req.actual_decision:
        raise HTTPException(status_code=400, detail="Question and actual decision are required")

    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    entry = f"{date_str}: For '{req.question}' → decided: {req.actual_decision}"
    if req.reflection:
        entry += f" (reflection: {req.reflection})"

    # 1. Append to user.md
    profile_service.append_to_section("Past Decisions & Outcomes", entry)

    # 2. Upsert to Qdrant vector memory
    point_id = qdrant_service.upsert_memory(
        text=entry,
        mem_type="decision_outcome",
        source="user.md",
        embed_fn=embeddings.embed_text,
        timestamp=datetime.utcnow().isoformat(),
    )

    new_count = qdrant_service.count_memories()

    return {
        "status": "ok",
        "appended": entry,
        "point_id": point_id,
        "memory_count": new_count,
    }

@router.put("/profile")
async def update_profile_markdown(raw_markdown: str = Body(..., embed=True)):
    profile_service.save_profile(raw_markdown)
    return {"status": "ok", "message": "Profile updated successfully"}
