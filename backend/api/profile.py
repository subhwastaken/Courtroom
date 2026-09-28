from fastapi import APIRouter, HTTPException, Body
from datetime import datetime
from models.schemas import OutcomeRequest, ProfileResponse, SynthesizeRequest, SynthesizeResponse
from services import profile_service, qdrant_service, embeddings, nim_service

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

@router.get("/profile/synthesizer-status")
async def get_synthesizer_status():
    return nim_service.get_engine_status()

@router.post("/profile/config-key")
async def configure_nvidia_key(body: dict = Body(...)):
    key = body.get("nvidia_api_key", "").strip()
    if not key:
        raise HTTPException(status_code=400, detail="NVIDIA API key cannot be empty")
    saved = nim_service.save_nvidia_api_key(key)
    if not saved:
        raise HTTPException(status_code=500, detail="Failed to save API key to .env")
    return {"status": "ok", "message": "NVIDIA API key saved and activated successfully"}

@router.post("/profile/synthesize", response_model=SynthesizeResponse)
async def synthesize_dossier(req: SynthesizeRequest):
    if not req.input_text or not req.input_text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty")

    # If the user passed a key directly, persist it
    if req.nvidia_api_key and req.nvidia_api_key.strip():
        nim_service.save_nvidia_api_key(req.nvidia_api_key.strip())

    existing_md = profile_service.load_profile()
    
    # 1. Synthesize structured markdown using NVIDIA NIM (or active fallback)
    result = await nim_service.synthesize_dossier_with_nim(
        input_text=req.input_text.strip(),
        user_name=req.user_name or "User",
        existing_md=existing_md,
        mode=req.mode,
        api_key_override=req.nvidia_api_key,
    )

    synthesized_md = result.get("raw_markdown", "")
    if not synthesized_md:
        raise HTTPException(status_code=500, detail="Failed to synthesize profile markdown")

    # 2. Save updated profile to user.md
    profile_service.save_profile(synthesized_md)

    # 3. If requested, sync extracted memories into Qdrant Cloud
    extracted_memories = result.get("extracted_memories", [])
    now_ts = datetime.utcnow().isoformat()
    if req.sync_to_qdrant and extracted_memories:
        for mem in extracted_memories:
            try:
                qdrant_service.upsert_memory(
                    text=mem["text"],
                    mem_type=mem.get("type", "statement"),
                    source=f"synthesizer:{result.get('model', 'llama')}",
                    embed_fn=embeddings.embed_text,
                    timestamp=now_ts,
                )
            except Exception as e:
                print(f"[Qdrant] Warning: Failed to upsert extracted memory: {e}")

    total_memories = qdrant_service.count_memories()

    return SynthesizeResponse(
        raw_markdown=synthesized_md,
        provider=result.get("provider", "nvidia-nim"),
        model=result.get("model", "meta/llama-3.1-8b-instruct"),
        extracted_memories_count=len(extracted_memories),
        memory_count=total_memories,
        status="ok"
    )

