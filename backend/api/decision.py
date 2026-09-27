from fastapi import APIRouter, HTTPException
from models.schemas import DecisionRequest, DecisionResponse, AgentTurn
from services import qdrant_service, lyzr_service, profile_service, embeddings

router = APIRouter()

@router.post("/decision", response_model=DecisionResponse)
async def make_decision(req: DecisionRequest):
    if not req.question or not req.question.strip():
        raise HTTPException(status_code=400, detail="Decision question cannot be empty")

    question = req.question.strip()

    # 1. Retrieve relevant memories from Qdrant
    memories = qdrant_service.search_memories(question, embeddings.embed_text, top_k=6)

    # 2. Load user.md living profile
    profile_text = profile_service.load_profile()

    # 3. Build shared context blob
    context_blob = profile_service.build_context_blob(profile_text, memories)

    # 4. Run the 3-agent debate
    result = await lyzr_service.run_debate(question, context_blob)

    # 5. Parse judge output into verdict + citations
    verdict, citations = profile_service.parse_judge_output(result["judge"])

    advocate_cited = [m["text"] for m in memories[:2]] if memories else ["Financial security > prestige"]
    skeptic_cited = [m["text"] for m in memories[2:4]] if len(memories) >= 4 else (
        [memories[0]["text"]] if memories else ["Recent statement on weekend on-call limits"]
    )

    turns = [
        AgentTurn(role="advocate", content=result["advocate"], cited_memories=advocate_cited),
        AgentTurn(role="skeptic", content=result["skeptic"], cited_memories=skeptic_cited),
        AgentTurn(role="judge", content=result["judge"], cited_memories=citations),
    ]

    return DecisionResponse(
        question=question,
        turns=turns,
        verdict=verdict,
        verdict_citations=citations,
    )
