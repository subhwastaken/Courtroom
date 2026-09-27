from fastapi import APIRouter, Request, HTTPException
from models.schemas import VoiceIngestRequest
from services import omi_service

router = APIRouter()

@router.post("/voice/webhook")
async def omi_webhook(request: Request):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    transcript = payload.get("transcript") or payload.get("text")
    if not transcript:
        return {"status": "ignored", "reason": "No transcript or text found in payload"}

    result = omi_service.ingest_voice_transcript(transcript, source="omi_webhook")
    return result

@router.post("/voice/ingest")
async def ingest_voice(req: VoiceIngestRequest):
    if not req.transcript or not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")

    result = omi_service.ingest_voice_transcript(req.transcript, source=req.source)
    return result
