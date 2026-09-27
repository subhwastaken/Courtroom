import os
from datetime import datetime
from services import qdrant_service, profile_service, embeddings

def ingest_voice_transcript(transcript: str, source: str = "voice") -> dict:
    clean_transcript = transcript.strip()
    if not clean_transcript:
        return {"status": "ignored", "reason": "empty transcript"}

    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"{timestamp[:10]}: \"{clean_transcript}\""

    # 1. Append to user.md
    profile_service.append_to_section("Recent Statements (auto-appended from voice/text)", entry)

    # 2. Embed into Qdrant
    point_id = qdrant_service.upsert_memory(
        text=clean_transcript,
        mem_type="voice_statement",
        source=source,
        embed_fn=embeddings.embed_text,
        timestamp=datetime.utcnow().isoformat(),
    )

    return {
        "status": "ingested",
        "entry": entry,
        "point_id": point_id,
        "transcript": clean_transcript,
    }
