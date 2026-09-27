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
        ("I regret not negotiating my previous compensation package aggressively when I held all the leverage", "regret"),
        ("I regret staying at a stagnant company 6 months longer than I should have purely out of comfort", "regret"),
        ("I regret trading my physical workout routine and weekends for an arbitrary sprint deadline", "regret"),
        ("Autonomy and intellectual freedom matter far more to me than corporate hierarchy", "value"),
        ("Health, rest, and sleep are my primary assets; burnout is non-recoverable through mere financial compensation", "value"),
        ("Financial growth and equity upside: I want high-leverage opportunities, not comfortable corporate mediocrity", "value"),
        ("I have a firm commitment to move closer to my family within the next 2-year window", "value"),
        ("Turned down an early-stage remote AI role for established corporate stability and felt trapped within 4 months", "decision_outcome"),
        ("Accepted a pay cut in exchange for strictly protected 40-hour workweeks and felt deep satisfaction and clarity", "decision_outcome"),
        ("I don't want another job where I'm constantly on call every single weekend. It destroys my peace", "voice_statement"),
        ("I am tired of playing it safe and watching other builders take bold bets. I need to back myself when the opportunity is real", "voice_statement"),
        ("Whenever I prioritize my sleep and health, my output is 10x higher. I can never sacrifice that again", "voice_statement"),
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
