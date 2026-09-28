import os
import re
import json
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime

NIM_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
DEFAULT_MODEL = "meta/llama-3.2-11b-vision-instruct"

def get_nim_config(api_key_override: Optional[str] = None):
    api_key = api_key_override or os.getenv("NVIDIA_API_KEY") or os.getenv("NVIDIA_NIM_API_KEY") or ""
    model = os.getenv("NVIDIA_NIM_MODEL", DEFAULT_MODEL)
    return api_key.strip(), model

def save_nvidia_api_key(api_key: str) -> bool:
    """Persist NVIDIA API key into backend/.env and update os.environ."""
    clean_key = api_key.strip()
    os.environ["NVIDIA_API_KEY"] = clean_key
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    try:
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                content = f.read()
            if "NVIDIA_API_KEY=" in content:
                new_content = re.sub(r"NVIDIA_API_KEY=.*", f"NVIDIA_API_KEY={clean_key}", content)
            else:
                new_content = content.rstrip() + f"\nNVIDIA_API_KEY={clean_key}\n"
            with open(env_path, "w", encoding="utf-8") as f:
                f.write(new_content)
        else:
            with open(env_path, "w", encoding="utf-8") as f:
                f.write(f"NVIDIA_API_KEY={clean_key}\n")
        return True
    except Exception as e:
        print(f"[NVIDIA Config] Error saving key to .env: {e}")
        return False

def get_engine_status() -> Dict[str, Any]:
    nim_key, model = get_nim_config()
    has_nim = bool(nim_key and len(nim_key) > 5)
    has_lyzr = bool(os.getenv("LYZR_API_KEY"))
    return {
        "has_nvidia_key": has_nim,
        "nvidia_model": model,
        "has_lyzr": has_lyzr,
        "primary_provider": "nvidia-nim" if has_nim else ("lyzr-agent-cloud" if has_lyzr else "smart-local"),
    }

SYSTEM_PROMPT = """You are the Supreme Judicial Clerk for "Courtroom Mode", an adversarial AI tribunal where autonomous agents (Advocate, Skeptic, and Judge) deliberate on life choices using the user's living history.

Your task is to transform informal, fragmented user statements (even a single sentence) into a rigorous, beautifully structured personal constitution Markdown dossier (user.md).

The required Markdown format MUST strictly follow this exact structure:

# {user_name} — Personal Dossier & Living Profile
*Updated automatically through Courtroom Mode deliberation, voice logs, and committed outcomes.*

---

## 🧭 Core Life Values & Priorities
- **[Concise Value Title]:** Detailed breakdown of this core priority, tradeoffs accepted, and what matters intrinsically.
- ...

---

## 🚫 Non-Negotiable Boundaries
- **[Boundary Title]:** Strict operational rule or boundary that cannot be compromised (e.g. no weekend on-call, runway floors).
- ...

---

## ⏳ Stated Regrets & Pain Points
- *"[First-person quote: I regret [action/hesitation] because [reason and lesson learned].]"*
- ...

---

## 📜 Historical Decisions & Baselines
- **[Date/Context]:** [Past dilemma or experience] -> *Outcome: [Key result, lesson, or baseline established].*
- ...

---

## 🎙️ Stated Reflections & Mindsets
- *"[First-person philosophical reflection or self-talk about risk, ambition, health, or boundaries]."*
- ...

CRITICAL GUIDELINES:
1. Deduce logical inferences from the user's sentence. For instance, if they say "I hate weekend work and want an AI startup", infer:
   - Core Values: Autonomy, high-upside innovation, engineering ownership.
   - Boundaries: Absolute refusal of recurring weekend firefighting or bureaucratic micromanagement.
   - Regrets/Pain Points: Hesitating on bold bets or staying in unchallenging corporate roles.
   - Baselines: Financial runway needed to build full-time.
2. Return ONLY the Markdown content. Do not include introductory conversational text or markdown code fences (```markdown).
"""

async def synthesize_dossier_with_nim(
    input_text: str,
    user_name: str = "User",
    existing_md: str = "",
    mode: str = "replace",
    api_key_override: Optional[str] = None,
) -> Dict[str, Any]:
    api_key, model = get_nim_config(api_key_override)

    # 1. If NVIDIA API key is available, use genuine NVIDIA NIM
    if api_key:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        if mode == "append" and existing_md.strip():
            user_prompt = f"""Here is the user's existing personal dossier (user.md):
\"\"\"
{existing_md}
\"\"\"

The user provided this new raw thought or reflection:
\"{input_text}\"

Please synthesize this new statement and integrate it seamlessly into the existing dossier. Add new bullet points under the matching sections (Values, Boundaries, Regrets, Decisions, Reflections). Keep all existing valuable records intact, and format the output cleanly according to the required schema."""
        else:
            user_prompt = f"""The user provided this informal raw statement about themselves, their work, lifestyle, or past experiences:
\"{input_text}\"

Synthesize this into a complete, comprehensive personal constitutional dossier for user "{user_name}" according to the exact required schema."""

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT.format(user_name=user_name)},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 1500,
        }

        try:
            print(f"[NVIDIA NIM] Invoking NIM API endpoint ({model})...")
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(NIM_BASE_URL, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                generated_md = data["choices"][0]["message"]["content"].strip()
                
                # Clean any wrapping ```markdown ... ``` fences if present
                generated_md = re.sub(r"^```markdown\s*", "", generated_md, flags=re.IGNORECASE)
                generated_md = re.sub(r"^```\s*", "", generated_md)
                generated_md = re.sub(r"\s*```$", "", generated_md).strip()

                if not generated_md.startswith("# "):
                    generated_md = f"# {user_name} — Personal Dossier & Living Profile\n*Updated automatically through Courtroom Mode deliberation, voice logs, and committed outcomes.*\n\n---\n\n" + generated_md

                extracted_memories = extract_memory_points(generated_md)

                return {
                    "raw_markdown": generated_md,
                    "provider": "nvidia-nim",
                    "model": model,
                    "extracted_memories": extracted_memories,
                    "status": "success"
                }
        except Exception as e:
            print(f"[NVIDIA NIM] Error invoking NIM API: {repr(e)}. Falling back to secondary agent...")

    # 2. If NVIDIA key is missing or failed, fall back to Lyzr Agent Studio LLM
    lyzr_result = await synthesize_dossier_with_lyzr(input_text, user_name, existing_md, mode)
    if lyzr_result:
        return lyzr_result

    # 3. Final fallback: Smart clean deterministic rule synthesizer
    print("[NVIDIA NIM] Using smart deterministic synthesizer fallback.")
    return fallback_synthesizer(input_text, user_name, existing_md, mode)


async def synthesize_dossier_with_lyzr(
    input_text: str,
    user_name: str = "User",
    existing_md: str = "",
    mode: str = "replace"
) -> Optional[Dict[str, Any]]:
    """Synthesize personal constitution using active Lyzr Agent Studio."""
    try:
        from services.lyzr_service import call_lyzr_agent
        judge_agent_id = os.getenv("LYZR_JUDGE_AGENT_ID")
        if not os.getenv("LYZR_API_KEY") or not judge_agent_id:
            return None

        if mode == "append" and existing_md.strip():
            prompt = f"""You are the Supreme Judicial Clerk. The user has an existing personal constitution Markdown dossier:
\"\"\"
{existing_md}
\"\"\"

The user added this new raw thought:
\"{input_text}\"

Please synthesize this new statement and integrate it seamlessly into the existing dossier. Add new bullet points under the matching sections (## 🧭 Core Life Values & Priorities, ## 🚫 Non-Negotiable Boundaries, ## ⏳ Stated Regrets & Pain Points, ## 📜 Historical Decisions & Baselines, ## 🎙️ Stated Reflections & Mindsets). Return ONLY the complete Markdown document."""
        else:
            prompt = f"""You are the Supreme Judicial Clerk. Transform this raw user statement into a comprehensive, beautifully structured personal constitution Markdown dossier for {user_name}:
\"{input_text}\"

The document MUST contain all 5 sections formatted with markdown bullet points:
# {user_name} — Personal Dossier & Living Profile
*Updated automatically through Courtroom Mode deliberation, voice logs, and committed outcomes.*

---

## 🧭 Core Life Values & Priorities
- **[Value Title]:** [Operational detail and tradeoffs]

---

## 🚫 Non-Negotiable Boundaries
- **[Boundary Title]:** [Strict boundary rule that cannot be violated]

---

## ⏳ Stated Regrets & Pain Points
- *"[Stated regret, hesitation, or pain point with lesson learned]"*

---

## 📜 Historical Decisions & Baselines
- **[Context/Baseline]:** [Detail on financial runway, technical focus, or past decision outcome]

---

## 🎙️ Stated Reflections & Mindsets
- *"[Direct reflection or philosophy from user]"*

Return ONLY the Markdown text without conversational preamble or code blocks."""

        print("[Synthesizer] Calling Lyzr Agent for LLM constitutional synthesis...")
        raw_res = await call_lyzr_agent(judge_agent_id, prompt)
        if raw_res and ("## " in raw_res or "Core Life Values" in raw_res):
            clean_md = re.sub(r"^```markdown\s*", "", raw_res.strip(), flags=re.IGNORECASE)
            clean_md = re.sub(r"^```\s*", "", clean_md)
            clean_md = re.sub(r"\s*```$", "", clean_md).strip()

            if not clean_md.startswith("# "):
                clean_md = f"# {user_name} — Personal Dossier & Living Profile\n*Updated automatically through Courtroom Mode deliberation, voice logs, and committed outcomes.*\n\n---\n\n" + clean_md

            extracted = extract_memory_points(clean_md)
            return {
                "raw_markdown": clean_md,
                "provider": "lyzr-agent-cloud (NVIDIA NIM fallback)",
                "model": "Lyzr Cloud LLM",
                "extracted_memories": extracted,
                "status": "success"
            }
    except Exception as e:
        print(f"[Synthesizer] Lyzr fallback error: {e}")
    return None


def fallback_synthesizer(
    input_text: str,
    user_name: str = "User",
    existing_md: str = "",
    mode: str = "replace"
) -> Dict[str, Any]:
    """Clean structured template synthesizer that formats sentences into the exact Courtroom structure."""
    clean_text = input_text.strip().strip('"\'')
    
    # Split sentences cleanly
    raw_parts = re.split(r"[.!?;\n]+", clean_text)
    sentences = [p.strip() for p in raw_parts if len(p.strip()) > 5]
    if not sentences:
        sentences = [clean_text]

    values: List[str] = []
    boundaries: List[str] = []
    regrets: List[str] = []
    decisions: List[str] = []
    reflections: List[str] = []

    for s in sentences:
        low = s.lower()
        if any(w in low for w in ["regret", "mistake", "should have", "wish i", "stayed too long", "hesitat"]):
            regrets.append(f"I regret past hesitation: '{s}'")
        elif any(w in low for w in ["never", "refuse", "hate", "won't", "wont", "boundary", "not accept", "no weekend", "burnout"]):
            boundaries.append(f"Operational Guardrail: Strict refusal of '{s}'")
        elif any(w in low for w in ["value", "freedom", "autonomy", "health", "sleep", "runway", "priority", "mastery", "build"]):
            values.append(f"Core Priority: '{s}'")
        elif any(w in low for w in ["decided", "quit", "joined", "turned down", "accepted", "chose", "built", "runway", "savings"]):
            decisions.append(f"Established Baseline: '{s}'")
        else:
            reflections.append(s)

    if not values:
        values.append(f"High-Leverage Execution & Autonomy: Derived from '{clean_text[:70]}'")
    if not boundaries:
        boundaries.append(f"Burnout Prevention: Intolerance for environments conflicting with personal priorities")
    if not regrets:
        regrets.append(f"I regret any passive hesitation that delays compounding technical depth.")
    if not decisions:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        decisions.append(f"{today}: Explicitly anchored personal operating baseline around '{clean_text[:60]}'")
    if not reflections:
        reflections.append(clean_text)

    if mode == "append" and existing_md.strip():
        updated_md = existing_md
        for v in values:
            updated_md = append_line_to_section(updated_md, "🧭 Core Life Values & Priorities", f"- **{v}**")
        for b in boundaries:
            updated_md = append_line_to_section(updated_md, "🚫 Non-Negotiable Boundaries", f"- **{b}**")
        for r in regrets:
            updated_md = append_line_to_section(updated_md, "⏳ Stated Regrets & Pain Points", f'- *"{r}"*')
        for d in decisions:
            updated_md = append_line_to_section(updated_md, "📜 Historical Decisions & Baselines", f"- {d}")
        for rf in reflections:
            today = datetime.utcnow().strftime("%Y-%m-%d")
            updated_md = append_line_to_section(updated_md, "🎙️ Stated Reflections & Mindsets", f'- **{today}:** *"{rf}"*')
        final_md = updated_md
    else:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        values_block = "\n".join([f"- **Key Value:** {v}" for v in values])
        boundaries_block = "\n".join([f"- **Non-Negotiable:** {b}" for b in boundaries])
        regrets_block = "\n".join([f'- *"{r}"*' for r in regrets])
        decisions_block = "\n".join([f"- {d}" for d in decisions])
        reflections_block = "\n".join([f'- **{today}:** *"{rf}"*' for rf in reflections])

        final_md = f"""# {user_name} — Personal Dossier & Living Profile
*Updated automatically through Courtroom Mode deliberation, voice logs, and committed outcomes.*

---

## 🧭 Core Life Values & Priorities
{values_block}

---

## 🚫 Non-Negotiable Boundaries
{boundaries_block}

---

## ⏳ Stated Regrets & Pain Points
{regrets_block}

---

## 📜 Historical Decisions & Baselines
{decisions_block}

---

## 🎙️ Stated Reflections & Mindsets
{reflections_block}
"""

    extracted_memories = extract_memory_points(final_md)

    return {
        "raw_markdown": final_md,
        "provider": "smart-local-synthesizer",
        "model": "rule-based-clean",
        "extracted_memories": extracted_memories,
        "status": "success"
    }


def append_line_to_section(md_text: str, section_header: str, new_line: str) -> str:
    pattern = rf"(##\s+{re.escape(section_header)}[^\n]*\n)"
    match = re.search(pattern, md_text, re.IGNORECASE)
    if match:
        idx = match.end()
        next_header = re.search(r"\n##\s+", md_text[idx:])
        if next_header:
            insert_pos = idx + next_header.start()
            return md_text[:insert_pos].rstrip() + "\n" + new_line + "\n\n" + md_text[insert_pos:].lstrip()
        else:
            return md_text.rstrip() + "\n" + new_line + "\n"
    else:
        return md_text.rstrip() + f"\n\n## {section_header}\n{new_line}\n"


def extract_memory_points(markdown_text: str) -> List[Dict[str, str]]:
    """Extract individual discrete memory items with semantic types for Qdrant indexing."""
    memories: List[Dict[str, str]] = []
    current_type = "statement"

    for line in markdown_text.splitlines():
        line_clean = line.strip()
        if not line_clean or line_clean.startswith("#") or line_clean.startswith("---") or line_clean.startswith("*Updated"):
            if line_clean.startswith("## "):
                header = line_clean[3:].lower()
                if "value" in header or "priorit" in header:
                    current_type = "value"
                elif "boundar" in header or "negotiable" in header:
                    current_type = "boundary"
                elif "regret" in header or "pain" in header:
                    current_type = "regret"
                elif "decision" in header or "outcome" in header or "baseline" in header:
                    current_type = "decision_outcome"
                elif "reflection" in header or "voice" in header or "mindset" in header:
                    current_type = "voice_statement"
                else:
                    current_type = "statement"
            continue

        if line_clean.startswith("- ") or re.match(r"^\d+\.\s+", line_clean):
            item_text = re.sub(r"^(?:-\s+|\d+\.\s+)", "", line_clean).strip()
            # Clean markdown bold markers or quotes
            item_text_clean = item_text.strip('"*\'')
            # Don't add header-like fragments
            if item_text_clean.startswith("##") or item_text_clean.startswith("#"):
                continue
            if len(item_text_clean) > 8:
                memories.append({
                    "text": item_text_clean,
                    "type": current_type,
                })

    return memories
