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

    # 4. Run the collaborative point-by-point debate
    result = await lyzr_service.run_debate(question, context_blob, memories)

    # 5. Parse turns and verdict
    actionable_decree = result.get("actionable_decree")

    if "turns" in result and result["turns"]:
        turns = [
            AgentTurn(
                role=t["role"],
                content=t["content"],
                cited_memories=[str(m) for m in t.get("cited_memories", []) if m is not None and str(m).strip()],
                actionable_decree=t.get("actionable_decree")
            )
            for t in result["turns"]
        ]
        verdict = result.get("verdict")
        citations = result.get("verdict_citations")
        if not verdict or not citations:
            parsed_v, parsed_c = profile_service.parse_judge_output(result.get("judge", ""))
            verdict = verdict or parsed_v
            citations = citations or parsed_c
        citations = [str(c) for c in (citations or []) if c is not None and str(c).strip()]
    else:
        verdict, citations = profile_service.parse_judge_output(result["judge"])
        advocate_cited = [m["text"] for m in memories[:2]] if memories else ["Financial security > prestige"]
        skeptic_cited = [m["text"] for m in memories[2:4]] if len(memories) >= 4 else (
            [memories[0]["text"]] if memories else ["Recent statement on weekend on-call limits"]
        )
        turns = [
            AgentTurn(role="advocate", content=result["advocate"], cited_memories=advocate_cited),
            AgentTurn(role="skeptic", content=result["skeptic"], cited_memories=skeptic_cited),
            AgentTurn(role="judge", content=result["judge"], cited_memories=citations, actionable_decree=actionable_decree),
        ]

    # Ensure last judge turn carries the decree if not explicitly set
    if turns and turns[-1].role == "judge" and not turns[-1].actionable_decree:
        turns[-1].actionable_decree = actionable_decree

    return DecisionResponse(
        question=question,
        turns=turns,
        verdict=verdict,
        verdict_citations=citations,
        actionable_decree=actionable_decree,
    )
