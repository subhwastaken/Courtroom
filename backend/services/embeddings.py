import os
from typing import List
import numpy as np

# Model singleton
_st_model = None
_embedding_dim = 384

def get_vector_size() -> int:
    provider = os.getenv("EMBEDDING_PROVIDER", "sentence-transformers").lower()
    if provider == "openai":
        return 1536
    return 384

def _get_sentence_transformer():
    global _st_model
    if _st_model is None:
        from sentence_transformers import SentenceTransformer
        # all-MiniLM-L6-v2 produces 384-dimensional dense vectors
        _st_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _st_model

def embed_text(text: str) -> List[float]:
    provider = os.getenv("EMBEDDING_PROVIDER", "sentence-transformers").lower()
    
    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            import httpx
            resp = httpx.post(
                "https://api.openai.com/v1/embeddings",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"input": text, "model": "text-embedding-3-small"},
                timeout=30.0,
            )
            resp.raise_for_status()
            return resp.json()["data"][0]["embedding"]

    # Default to sentence-transformers
    try:
        model = _get_sentence_transformer()
        vector = model.encode(text, normalize_embeddings=True)
        return vector.tolist()
    except Exception as e:
        print(f"[Embeddings] Falling back to deterministic pseudo-embedding due to: {e}")
        # Deterministic 384-dim pseudo embedding fallback to prevent any runtime crash
        rng = np.random.RandomState(abs(hash(text)) % (2**32))
        vec = rng.randn(384)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()
