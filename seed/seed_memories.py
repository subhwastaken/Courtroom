import sys
import os
from datetime import datetime

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from services import qdrant_service, embeddings

def run_seed():
    vector_size = embeddings.get_vector_size()
    qdrant_service.ensure_collection(vector_size=vector_size)

    seed_memories = [
        ("I regret not negotiating my last salary", "regret"),
        ("Financial security matters more to me than prestige", "value"),
        ("I want to move closer to my family within the next two years", "value"),
        ("I turned down a remote role for stability and regretted it", "decision_outcome"),
        ("I took a pay cut once for better work-life balance and was satisfied", "decision_outcome"),
        ("I don't want another job where I'm on call every weekend", "voice_statement"),
        ("I described myself as cautious but tired of playing it safe", "value"),
    ]

    print(f"[Seed] Seeding {len(seed_memories)} memories into Qdrant collection 'user_memories'...")
    for text, mem_type in seed_memories:
        point_id = qdrant_service.upsert_memory(
            text=text,
            mem_type=mem_type,
            source="seed",
            embed_fn=embeddings.embed_text,
            timestamp=datetime.utcnow().isoformat(),
        )
        print(f"  + Added [{mem_type}]: \"{text}\" (id: {point_id[:8]}...)")

    total = qdrant_service.count_memories()
    print(f"\n[Seed] Complete! Total memories in Qdrant: {total}")

if __name__ == "__main__":
    run_seed()
