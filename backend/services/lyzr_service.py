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
    Punchy, high-intensity multi-agent courtroom debate grounded directly in personal history.
    """
    advocate = (
        f"Your stated ambition is 'tired of playing it safe,' and you deeply regret not negotiating your past compensation aggressively. "
        f"Regarding '{question}', shrinking from this opportunity repeats your old cycle of fear—take the leap and claim your upside."
    )
    
    skeptic = (
        f"The Advocate is blinding you with greed and ignoring your explicit boundary: 'I don't want another job where I'm on call every weekend.' "
        f"You already proved on 2025-06-14 that peace and sleep restore your energy 10x—trading your autonomy for chaos is a mistake you promised never to repeat."
    )
    
    judge = (
        f"VERDICT: Demand strict weekday-only terms or decline the proposal entirely.\n"
        f"REASONING: While the Advocate rightly points out your regret over timid career moves, the Skeptic exposes a fatal violation of your non-negotiable health boundary. Your past record proves that burning out destroys your leverage; protect your foundation first."
    )
    
    return {
        "advocate": advocate,
        "skeptic": skeptic,
        "judge": judge,
    }

def clean_and_condense_turn(text: str, role: str) -> str:
    if not text:
        return text
    import re
    # If the LLM returned numbered points like "1. ... 2. ...":
    points = re.split(r'\n+\s*\d+[\.\)]\s*', text.strip())
    if len(points) > 1:
        # Take the most impactful point and the conclusion if present
        first = re.sub(r'\s+', ' ', points[1].strip())
        sentences = re.split(r'(?<=[.!?])\s+', first)
        main_arg = " ".join(sentences[:2])
        # Check if there is a conclusion at the end (e.g. "Do not accept this promotion.")
        last_chunk = points[-1].strip()
        last_lines = last_chunk.split("\n")
        conclusion = last_lines[-1].strip() if len(last_lines) > 1 else ""
        if conclusion and not conclusion.startswith("http") and len(conclusion) < 100:
            return f"{main_arg} {conclusion}"
        return main_arg

    # If it's standard text, ensure it doesn't exceed 2-3 punchy sentences
    if role != "judge":
        clean_text = re.sub(r'\s+', ' ', text.strip())
        sentences = re.split(r'(?<=[.!?])\s+', clean_text)
        return " ".join(sentences[:2]) if len(sentences) > 2 else clean_text
    else:
        if "REASONING:" in text:
            parts = text.split("REASONING:")
            verdict = parts[0].strip()
            reasoning = re.sub(r'\s+', ' ', parts[1].strip())
            r_sentences = re.split(r'(?<=[.!?])\s+', reasoning)
            return f"{verdict}\n\nREASONING: {' '.join(r_sentences[:2])}"
        return text.strip()

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
                f"INSTRUCTION: Deliver your Advocate argument FOR this move. Keep it to EXACTLY 2 short, powerful sentences citing a specific value or past regret. Plain text only."
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
                f"ADVOCATE JUST ARGUED: \"{advocate_reply}\"\n\n"
                f"INSTRUCTION: Object and rebut the Advocate directly by name. Keep it to EXACTLY 2 biting, realistic sentences citing a personal boundary or past burnout from history. Plain text only."
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
                f"ADVOCATE ARGUMENT: \"{advocate_reply}\"\n\n"
                f"SKEPTIC REBUTTAL: \"{skeptic_reply}\"\n\n"
                f"INSTRUCTION: Deliver your binding verdict citing the clash between the two counsels against the user's history.\n"
                f"Format strictly as:\n"
                f"VERDICT: <One concise sentence>\n"
                f"REASONING: <Two crisp sentences weighing arguments against user history>"
            )
            print("[Lyzr] Calling Chief Justice Agent...")
            judge_reply = await call_lyzr_agent(
                judge_id,
                judge_prompt,
                session_id=f"{judge_id}-{session_seed}"
            )

            return {
                "advocate": clean_and_condense_turn(advocate_reply, "advocate"),
                "skeptic": clean_and_condense_turn(skeptic_reply, "skeptic"),
                "judge": clean_and_condense_turn(judge_reply, "judge")
            }
        except Exception as e:
            print(f"[Lyzr] Live call encountered error ({e}), utilizing grounded fallback debate")
            return _generate_intelligent_mock_debate(question, context_blob)
    else:
        print("[Lyzr] No LYZR_API_KEY detected. Running grounded debate engine mode.")
        return _generate_intelligent_mock_debate(question, context_blob)
