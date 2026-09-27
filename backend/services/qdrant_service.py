import os
import uuid
from typing import List, Dict, Any, Callable
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

COLLECTION = "user_memories"

_client: QdrantClient = None

def get_client() -> QdrantClient:
    global _client
    if _client is None:
        url = os.getenv("QDRANT_URL")
        api_key = os.getenv("QDRANT_API_KEY")
        
        if url:
            print(f"[Qdrant] Connecting to remote Qdrant at {url}")
            _client = QdrantClient(url=url, api_key=api_key or None)
        else:
            storage_path = os.path.join(os.path.dirname(__file__), "..", "data", "qdrant_storage")
            os.makedirs(storage_path, exist_ok=True)
            print(f"[Qdrant] Using embedded local storage at {storage_path}")
            try:
                _client = QdrantClient(path=storage_path)
            except Exception as e:
                print(f"[Qdrant] Local path locked or unavailable ({e}), using in-memory mode")
                _client = QdrantClient(location=":memory:")
    return _client

def ensure_collection(vector_size: int = 384):
    client = get_client()
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION not in collections:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=qmodels.VectorParams(size=vector_size, distance=qmodels.Distance.COSINE),
        )
        print(f"[Qdrant] Created collection '{COLLECTION}' with vector size {vector_size}")
    else:
        print(f"[Qdrant] Collection '{COLLECTION}' already exists.")

def upsert_memory(text: str, mem_type: str, source: str, embed_fn: Callable[[str], List[float]], timestamp: str) -> str:
    client = get_client()
    vector = embed_fn(text)
    point_id = str(uuid.uuid4())
    client.upsert(
        collection_name=COLLECTION,
        points=[
            qmodels.PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "text": text,
                    "type": mem_type,
                    "source": source,
                    "timestamp": timestamp,
                }
            )
        ]
    )
    return point_id

def search_memories(query: str, embed_fn: Callable[[str], List[float]], top_k: int = 5) -> List[Dict[str, Any]]:
    client = get_client()
    vector = embed_fn(query)
    
    # Modern qdrant-client >= 1.10 uses query_points
    if hasattr(client, "query_points"):
        response = client.query_points(
            collection_name=COLLECTION,
            query=vector,
            limit=top_k,
        )
        results = response.points
    elif hasattr(client, "search"):
        results = client.search(
            collection_name=COLLECTION,
            query_vector=vector,
            limit=top_k,
        )
    else:
        results = []

    return [
        {
            "id": str(r.id),
            "score": float(r.score) if hasattr(r, "score") and r.score is not None else 1.0,
            **(r.payload or {})
        }
        for r in results
    ]

def count_memories() -> int:
    try:
        client = get_client()
        info = client.get_collection(collection_name=COLLECTION)
        return info.points_count or 0
    except Exception:
        return 0

def get_all_memories(limit: int = 50) -> List[Dict[str, Any]]:
    try:
        client = get_client()
        points, _ = client.scroll(collection_name=COLLECTION, limit=limit, with_payload=True)
        return [
            {
                "id": p.id,
                **p.payload
            }
            for p in points
        ]
    except Exception as e:
        print(f"[Qdrant] Error scrolling memories: {e}")
        return []
