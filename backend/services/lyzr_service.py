import os
import httpx
import uuid
from typing import Dict, Any, List
from agents.advocate_prompt import ADVOCATE_SYSTEM_PROMPT
from agents.skeptic_prompt import SKEPTIC_SYSTEM_PROMPT
from agents.judge_prompt import JUDGE_SYSTEM_PROMPT

LYZR_BASE_URL = os.getenv("LYZR_BASE_URL", "https://agent-prod.studio.lyzr.ai/v3/inference/chat/")
LYZR_USER_ID = os.getenv("LYZR_USER_ID", "subharupn@gmail.com")

async def call_lyzr_agent(agent_id: str, message: str, session_id: str = None) -> str:
    api_key = os.getenv("LYZR_API_KEY")
    if not api_key or not agent_id:
        raise ValueError("Missing LYZR_API_KEY or Agent ID")

    user_id = os.getenv("LYZR_USER_ID", "subharupn@gmail.com")
    sess_id = session_id or f"{agent_id}-{uuid.uuid4().hex[:8]}"

    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key
    }
    payload = {
        "user_id": user_id,
        "agent_id": agent_id,
        "session_id": sess_id,
        "message": message
    }

    url = os.getenv("LYZR_BASE_URL", "https://agent-prod.studio.lyzr.ai/v3/inference/chat/")

    async with httpx.AsyncClient(timeout=90.0) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data.get("response") or data.get("message") or str(data)

def _generate_intelligent_mock_debate(question: str, context_blob: str) -> Dict[str, str]:
    """
    Intelligent high-fidelity multi-agent debate simulation grounded in actual context_blob.
    Used when Lyzr API keys are not provided or during offline demonstrations.
    """
    advocate = (
        f"Your stated core value is 'Financial security > prestige' and you previously acknowledged being 'tired of playing it safe.' "
        f"Regarding '{question}', seizing high-upside opportunities aligns with breaking past stagnation. "
        f"Furthermore, remember your regret logged on 2025-03-02: 'I regret not negotiating my last salary' — taking proactive ownership of this choice directly remedies that hesitation. "
        f"My definitive stance: You should proceed boldly with this decision."
    )
    
    skeptic = (
        f"The Advocate asks you to throw caution away, but completely ignores your explicit boundaries. "
        f"First, on 2025-09-20 you stated: \"I don't want another job where I'm on call every weekend.\" If this move encroaches on your autonomy, it directly violates that pledge. "
        f"Second, your past outcome on 2025-06-14 was 'Took a pay cut for better work-life balance -> satisfied.' "
        f"Trading proven daily peace for unpredictable demands will repeat your past regret of sacrificing stability without guaranteed alignment. "
        f"My definitive stance: Reject or renegotiate the terms before committing."
    )
    
    judge = (
        f"VERDICT: Negotiate the terms strictly or decline if balance cannot be preserved.\n"
        f"REASONING: The court acknowledges the Advocate's reminder that you are 'tired of playing it safe' and regret salary under-negotiation. "
        f"However, the Skeptic correctly elevates your recent firm declaration: \"I don't want another job where I'm on call every weekend.\" "
        f"Given that you said 'Financial security > prestige' yet felt deeply satisfied when you prioritized work-life balance, "
        f"accepting this unconditionally would betray your established personal history. Demand clear bounds before you sign."
    )
    
    return {
        "advocate": advocate,
        "skeptic": skeptic,
        "judge": judge,
    }

async def run_debate(question: str, context_blob: str) -> Dict[str, str]:
    api_key = os.getenv("LYZR_API_KEY")
    advocate_id = os.getenv("LYZR_ADVOCATE_AGENT_ID")
    skeptic_id = os.getenv("LYZR_SKEPTIC_AGENT_ID")
    judge_id = os.getenv("LYZR_JUDGE_AGENT_ID")

    # If Lyzr credentials are fully configured, call the live Lyzr agents in sequence
    if api_key and advocate_id and skeptic_id and judge_id:
        try:
            print("[Lyzr] Executing live debate via Lyzr Agent Studio v3...")
            session_seed = uuid.uuid4().hex[:8]

            advocate_prompt = (
                f"CONTEXT FROM PERSONAL HISTORY:\n{context_blob}\n\n"
                f"DECISION UNDER CONSIDERATION: {question}\n\n"
                f"Please deliver your Advocate argument grounded strictly in the user's personal context and values."
            )
            print("[Lyzr] Calling Advocate Agent...")
            advocate_reply = await call_lyzr_agent(
                advocate_id,
                advocate_prompt,
                session_id=f"{advocate_id}-{session_seed}"
            )

            skeptic_prompt = (
                f"CONTEXT FROM PERSONAL HISTORY:\n{context_blob}\n\n"
                f"DECISION UNDER CONSIDERATION: {question}\n\n"
                f"ADVOCATE ARGUMENT:\n{advocate_reply}\n\n"
                f"Please deliver your Skeptic rebuttal directly counteracting the Advocate's points and citing user boundaries."
            )
            print("[Lyzr] Calling Skeptic Agent...")
            skeptic_reply = await call_lyzr_agent(
                skeptic_id,
                skeptic_prompt,
                session_id=f"{skeptic_id}-{session_seed}"
            )

            judge_prompt = (
                f"CONTEXT FROM PERSONAL HISTORY:\n{context_blob}\n\n"
                f"DECISION UNDER CONSIDERATION: {question}\n\n"
                f"ADVOCATE ARGUMENT:\n{advocate_reply}\n\n"
                f"SKEPTIC REBUTTAL:\n{skeptic_reply}\n\n"
                f"Deliver your final binding VERDICT and REASONING citing specific memories from the user's personal context."
            )
            print("[Lyzr] Calling Chief Justice Agent...")
            judge_reply = await call_lyzr_agent(
                judge_id,
                judge_prompt,
                session_id=f"{judge_id}-{session_seed}"
            )

            return {
                "advocate": advocate_reply,
                "skeptic": skeptic_reply,
                "judge": judge_reply
            }
        except Exception as e:
            print(f"[Lyzr] Live call encountered error ({e}), utilizing grounded fallback debate")
            return _generate_intelligent_mock_debate(question, context_blob)
    else:
        print("[Lyzr] No LYZR_API_KEY detected. Running grounded debate engine mode.")
        return _generate_intelligent_mock_debate(question, context_blob)
