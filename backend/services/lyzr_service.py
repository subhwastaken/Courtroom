import os
import re
import json
import httpx
import uuid
from typing import Dict, Any, List, Optional

NIM_BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

def determine_debate_depth(question: str) -> int:
    """
    Intelligently determines the number of courtroom debate turns based on stakes,
    complexity, and dilemma scope.
    - Low-stakes / micro decisions: 3-4 turns (quick, punchy, no stalling)
    - Moderate career/finance decisions: 5-7 turns (standard balanced trial)
    - High-stakes life inflection points: 8-12 turns (deep cross-examination, capped to avoid fatigue)
    """
    q = question.strip().lower()
    words = re.findall(r'\b\w+\b', q)
    word_count = len(words)

    high_stakes_keywords = [
        "quit", "cofounder", "co-founder", "startup", "equity", "investment", "seed round",
        "mortgage", "divorce", "move to", "relocate", "career change", "lawsuit", "debt",
        "burnout", "all in", "drop out", "fire", "layoff", "leaving my job", "runway", "founder"
    ]
    
    low_stakes_keywords = [
        "buy", "purchase", "coffee", "espresso", "lunch", "gym", "game", "book", "shoes",
        "reply to slack", "watch", "message", "weekend plan", "dinner", "snack", "desk", "chair"
    ]

    is_high_stakes = any(k in q for k in high_stakes_keywords) or (word_count >= 20) or ("versus" in q) or (" vs " in q)
    is_low_stakes = any(k in q for k in low_stakes_keywords) and not is_high_stakes and (word_count <= 8)

    if is_low_stakes:
        return 3 if word_count <= 6 else 4
    elif is_high_stakes:
        if word_count > 25 or ("cofounder" in q and "quit" in q):
            return 11
        return 9
    else:
        return 6

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

async def generate_debate_with_nim(
    question: str, context_blob: str, memories: List[Dict[str, Any]], target_turns: int
) -> Optional[Dict[str, Any]]:
    """Generate dynamic multi-turn debate using fast NVIDIA NIM API if key is available."""
    api_key = os.getenv("NVIDIA_API_KEY") or os.getenv("NVIDIA_NIM_API_KEY")
    if not api_key:
        return None

    model = os.getenv("NVIDIA_NIM_MODEL", "meta/llama-3.2-11b-vision-instruct")

    system_prompt = f"""You are the Courtroom Mode Deliberation Engine.
Three agents deliberate on the user's dilemma based on their living history:
1. Advocate (Counsel for Opportunity & Ambition)
2. Skeptic (Counsel for Caution & Boundaries)
3. Chief Justice (Supreme Arbiter who issues directions and the final binding verdict)

CRITICAL INSTRUCTIONS:
- You must generate EXACTLY {target_turns} turns.
- Roles must alternate logically:
  * For 3 turns: advocate -> skeptic -> judge (final verdict)
  * For 4 turns: advocate -> skeptic -> judge (direction) -> judge (final verdict)
  * For 5-7 turns: advocate -> skeptic -> judge -> advocate -> skeptic -> judge (final verdict)
  * For 8-12 turns: multi-round cross-examination closing with judge (final verdict)
- Each utterance should be punchy, high-intensity, and cite real principles or memories from the user's history.
- Return ONLY valid JSON in this exact schema:
{{
  "turns": [
    {{"role": "advocate" | "skeptic" | "judge", "content": "1-2 sentences of argument", "cited_memories": ["relevant quote"]}}
  ],
  "verdict": "One clear, decisive, actionable ruling sentence",
  "verdict_citations": ["memory or principle cited"],
  "actionable_decree": "One crisp, direct sentence instructing the user what to do right now (e.g. 'Have coffee if working before 2 PM, else drink water and walk.')"
}}
Do NOT output any markdown backticks or commentary outside the JSON.
"""

    user_prompt = f"""USER CONSTITUTION & VECTOR MEMORIES:
{context_blob}

CASE DILEMMA TO PUT ON TRIAL:
"{question}"

Generate the {target_turns}-turn adversarial courtroom debate as JSON."""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
        "max_tokens": 1400,
    }

    try:
        print(f"[NVIDIA NIM] Generating dynamic {target_turns}-turn debate via {model} (JSON mode)...")
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(NIM_BASE_URL, headers=headers, json=payload)
            resp.raise_for_status()
            raw_text = resp.json()["choices"][0]["message"]["content"].strip()
            
            # Extract JSON cleanly
            json_match = re.search(r'\{[\s\S]*\}', raw_text)
            if json_match:
                parsed = json.loads(json_match.group(0))
                if "turns" in parsed and len(parsed["turns"]) > 0:
                    return parsed
    except Exception as e:
        err_msg = str(e) or repr(e)
        print(f"[NVIDIA NIM] Debate generation error: {err_msg}. Falling back to grounded dynamic engine.")
    return None

def _generate_grounded_dynamic_debate(
    question: str, context_blob: str, memories: List[Dict[str, Any]] = None, target_turns: int = 6
) -> Dict[str, Any]:
    """
    Intelligent, grounded debate engine that dynamically generates 3 to 12 turns
    tailored to the dilemma's complexity and domain.
    """
    q_lower = question.lower()
    memories = memories or []

    # Domain classification
    caffeine_keywords = [
        "coffee", "caffeine", "espresso", "latte", "cappuccino", "tea", "drink coffee",
        "have a coffee", "cup of coffee", "energy drink"
    ]
    is_caffeine = any(k in q_lower for k in caffeine_keywords)

    fitness_keywords = [
        "shoe", "shoes", "running", "run", "gym", "workout", "fitness", "exercise",
        "marathon", "sneaker", "sneakers", "cardio", "training", "diet", "sleep"
    ]
    is_fitness = any(k in q_lower for k in fitness_keywords) and not is_caffeine

    micro_keywords = [
        "buy", "purchase", "desk", "chair", "gadget", "keyboard",
        "monitor", "book", "game", "snack", "watch"
    ]
    is_micro_purchase = any(k in q_lower for k in micro_keywords) and not is_fitness and not is_caffeine

    # Find relevant memories if they exist in Qdrant
    ambition_mem = None
    boundary_mem = None
    regret_mem = None
    health_mem = None

    for m in memories:
        t = m.get("text", "")
        low = t.lower()
        if any(w in low for w in ["safe", "bold", "ambition", "build", "risk"]):
            ambition_mem = t
        elif any(w in low for w in ["on call", "weekend", "boundary", "guardrail", "burnout"]):
            boundary_mem = t
        elif any(w in low for w in ["negotiat", "salary", "regret", "leverage"]):
            regret_mem = t
        elif any(w in low for w in ["sleep", "health", "output", "energy", "body"]):
            health_mem = t

    turns = []

    # ──────────────────────────────────────────────────────────
    # CASE 0: CAFFEINE & COGNITIVE CONSUMABLES (e.g. Coffee, Tea)
    # ──────────────────────────────────────────────────────────
    if is_caffeine:
        adv_citation = health_mem or "Cognitive Velocity & Deliberate Focus Rituals"
        skp_citation = "Sleep Architecture & Adenosine Management"
        decree = "Have the coffee if it's before 2 PM and you're diving into deep work; skip it if you're just bored or stalling."

        # Turn 1: Advocate
        turns.append({
            "role": "advocate",
            "content": f"Regarding '{question}', deliberate caffeine consumption elevates dopamine, blocks adenosine, and sharpens analytical velocity. If you are entering a high-leverage block of creative or analytical problem-solving, strategic caffeine provides immediate cognitive momentum.",
            "cited_memories": [adv_citation]
        })
        # Turn 2: Skeptic
        turns.append({
            "role": "skeptic",
            "content": f"Objection! Reaching for caffeine is frequently a compulsive avoidance reflex when confronting mental friction or mild boredom. If you are masking chronic sleep debt or drinking this late in the day, you trigger cortisol spikes, energy crashes, and destroy tonight's deep restorative sleep.",
            "cited_memories": [skp_citation]
        })
        # Turn 3: Judge (Direction if 4 turns)
        if target_turns == 4:
            turns.append({
                "role": "judge",
                "content": f"Order in the court. The bench notes the Skeptic's warning on sleep disruption and avoidance reflexes, but recognizes the Advocate's evidence on focus amplification. Counsel, what is the current time of day and what task is immediately scheduled?",
                "cited_memories": ["Daily Energy Optimization & Sleep Hygiene"]
            })
        # Final Judge Verdict
        verdict = f"VERDICT: Conditionally Approved—Consume only if it is before 2:00 PM and you immediately channel the focus into a defined deep-work sprint; otherwise drink a tall glass of water and take a 5-minute walking break."
        reasoning = f"REASONING: The tribunal recognizes caffeine as a potent cognitive tool when deployed strategically. However, chemical stimulation cannot compensate for poor sleep or procrastination. Drink it with clear intent or skip it."
        turns.append({
            "role": "judge",
            "content": f"{verdict}\n\n{reasoning}",
            "cited_memories": [adv_citation, skp_citation],
            "actionable_decree": decree
        })

        return {
            "turns": turns,
            "advocate": turns[0]["content"],
            "skeptic": turns[1]["content"],
            "judge": turns[-1]["content"],
            "verdict": verdict.replace("VERDICT:", "").strip(),
            "verdict_citations": [adv_citation, skp_citation],
            "actionable_decree": decree
        }

    # ──────────────────────────────────────────────────────────
    # CASE 1: FITNESS & PHYSICAL HEALTH (e.g. Running Shoes, Gym)
    # ──────────────────────────────────────────────────────────
    if is_fitness:
        adv_citation = health_mem or "Physical Conditioning & Biomechanical Longevity"
        skp_citation = "Aspirational Consumerism: Gear Cannot Substitute Discipline"
        decree = "Buy them if you commit to 3 runs this week; otherwise log 5 miles in your existing sneakers first."

        # Turn 1: Advocate
        turns.append({
            "role": "advocate",
            "content": f"Regarding '{question}', your physical vehicle is the foundation of your cognitive clarity, energy, and mental endurance. Investing in proper biomechanical support prevents joint pain, removes friction to regular exercise, and compounds your daily vitality.",
            "cited_memories": [adv_citation]
        })
        # Turn 2: Skeptic
        turns.append({
            "role": "skeptic",
            "content": f"Objection! Buying equipment is the classic trap of 'aspirational shopping'—purchasing gear delivers quick dopamine and makes you feel like an athlete without taking a single stride. If you haven't been running consistently in your existing shoes, buying a new pair is merely procrastination disguised as self-improvement.",
            "cited_memories": [skp_citation]
        })
        # Turn 3: Judge (Direction if 4 turns)
        if target_turns == 4:
            turns.append({
                "role": "judge",
                "content": f"Order in the court. The bench notes the Skeptic's warning on gear procrastination, but recognizes the Advocate's point on joint protection and injury prevention. Does the user currently have a verifiable running habit?",
                "cited_memories": ["Physical Well-Being & Operational Commitment"]
            })
        # Final Judge Verdict
        verdict = f"VERDICT: Conditionally Approved—Purchase if you commit to a concrete 14-day schedule (e.g. 3 runs or walks this week), or purchase immediately if your current footwear causes verifiable joint pain or blisters."
        reasoning = f"REASONING: The tribunal rules that physical health and injury prevention are high-leverage investments that pay compounding dividends. However, the Skeptic is right that equipment does not equal commitment. Tie the acquisition directly to immediate physical execution from your discretionary buffer."
        turns.append({
            "role": "judge",
            "content": f"{verdict}\n\n{reasoning}",
            "cited_memories": [adv_citation, skp_citation],
            "actionable_decree": decree
        })

        return {
            "turns": turns,
            "advocate": turns[0]["content"],
            "skeptic": turns[1]["content"],
            "judge": turns[-1]["content"],
            "verdict": verdict.replace("VERDICT:", "").strip(),
            "verdict_citations": [adv_citation, skp_citation],
            "actionable_decree": decree
        }

    # ──────────────────────────────────────────────────────────
    # CASE 2: GENERAL MICRO DECISION (3 - 4 TURNS)
    # ──────────────────────────────────────────────────────────
    if target_turns <= 4:
        adv_cite = ambition_mem or "Daily Friction Reduction & Preserving Cognitive Willpower"
        skp_cite = boundary_mem or "Financial Discipline: Guard Against Mindless Consumer Creep"
        decree = "Buy it if it eliminates a recurring weekly bottleneck from discretionary funds; otherwise wait 48 hours."

        # Turn 1: Advocate
        turns.append({
            "role": "advocate",
            "content": f"Regarding '{question}', daily friction-reducing tools or deliberate micro-pleasures compound creative momentum. Agonizing over small expenses drains cognitive bandwidth that should be focused on high-leverage goals.",
            "cited_memories": [adv_cite]
        })
        # Turn 2: Skeptic
        turns.append({
            "role": "skeptic",
            "content": f"Objection! Unexamined micro-purchases accumulate into chronic lifestyle inflation. If this is an impulse purchase triggered by temporary boredom or dopamine-seeking, it clutters your environment and leaks funds without delivering long-term utility.",
            "cited_memories": [skp_cite]
        })
        if target_turns == 4:
            turns.append({
                "role": "judge",
                "content": f"Order in the court. The bench notes the Skeptic's warning on impulse creep, but recognizes the Advocate's point on energy efficiency. Does this directly threaten the user's primary baseline runway?",
                "cited_memories": ["Financial Runway & Baseline Discipline"]
            })
        # Final Judge Verdict
        verdict = f"VERDICT: Approved with discipline—proceed if funded strictly from discretionary buffer without touching core runway; otherwise dismiss immediately."
        reasoning = f"REASONING: Micro-decisions should not paralyze cognitive bandwidth. The Skeptic is right to guard against mindless leakage, but the Advocate correctly notes that excessive hesitation over trivial friction drains creative momentum."
        turns.append({
            "role": "judge",
            "content": f"{verdict}\n\n{reasoning}",
            "cited_memories": [adv_cite, skp_cite],
            "actionable_decree": decree
        })

        return {
            "turns": turns,
            "advocate": turns[0]["content"],
            "skeptic": turns[1]["content"],
            "judge": turns[-1]["content"],
            "verdict": verdict.replace("VERDICT:", "").strip(),
            "verdict_citations": [adv_cite, skp_cite],
            "actionable_decree": decree
        }

    # ──────────────────────────────────────────────────────────
    # CASE 3: BALANCED DILEMMA (5 - 7 TURNS, DEFAULT 6)
    # ──────────────────────────────────────────────────────────
    ambition_cite = ambition_mem or "Tired of playing it safe and watching other builders take bold bets"
    boundary_cite = boundary_mem or "I don't want another job where I'm constantly on call every single weekend"
    regret_cite = regret_mem or "I regret not negotiating my previous compensation package aggressively when I held all the leverage"
    health_cite = health_mem or "Whenever I prioritize my sleep and health, my output is 10x higher"
    decree_balanced = "Demand written boundaries and compensation protections upfront; decline immediately if denied."

    if target_turns <= 7:
        t1 = f"Regarding '{question}', your constitutional dossier emphasizes: '{ambition_cite}'. Hesitating on this move repeats past paralysis—you hold leverage and must claim your upside."
        t2 = f"Objection! The Advocate ignores your sworn boundary: '{boundary_cite}'. Trading your mental autonomy for chaotic promises violates your primary commitment to health and stability."
        t3 = f"Order in the court. The bench recognizes Counsel Skeptic's challenge on boundary erosion. Advocate, address this directly: what explicit contractual guardrail prevents burnout?"
        t4 = f"Your Honor, we do not surrender peace—we negotiate it upfront! As recorded in your regret: '{regret_cite}', your past mistake was staying silent, not taking the bold bet."
        t5 = f"Counsel's optimism is dangerous rationalization! Verbal promises dissolve under pressure without binding penalty clauses. Your history proves unhedged optimism leads to exhaustion."
        t6 = (
            f"VERDICT: Proceed strictly under conditional terms—demand explicit written boundaries and compensation protections upfront; decline outright if denied.\n\n"
            f"REASONING: The Advocate rightly notes that fear of boldness has historically caused deep regret, but the Skeptic correctly identifies that unhedged commitments destroy your health. Secure the boundary in writing first."
        )

        turns = [
            {"role": "advocate", "content": t1, "cited_memories": [ambition_cite]},
            {"role": "skeptic", "content": t2, "cited_memories": [boundary_cite, health_cite]},
            {"role": "judge", "content": t3, "cited_memories": ["Autonomy & Intellectual Freedom > Corporate Hierarchy"]},
            {"role": "advocate", "content": t4, "cited_memories": [regret_cite]},
            {"role": "skeptic", "content": t5, "cited_memories": [boundary_cite, "No Uncapped Weekend On-Call"]},
            {"role": "judge", "content": t6, "cited_memories": [boundary_cite, ambition_cite, regret_cite], "actionable_decree": decree_balanced},
        ]

        return {
            "turns": turns,
            "advocate": f"{t1} {t4}",
            "skeptic": f"{t2} {t5}",
            "judge": t6,
            "verdict": "Proceed strictly under conditional terms—demand explicit written boundaries and compensation protections upfront; decline outright if denied.",
            "verdict_citations": [boundary_cite, ambition_cite, regret_cite],
            "actionable_decree": decree_balanced
        }

    # ──────────────────────────────────────────────────────────
    # CASE 4: HIGH-STAKES / DEEP ADVERSARIAL TRIAL (8 - 12 TURNS)
    # ──────────────────────────────────────────────────────────
    amb_cite = ambition_mem or "Foundational Ambition: Pursue high-leverage technical mastery and bold bets"
    bnd_cite = boundary_mem or "Non-Negotiable Boundary: Strict protection against chronic burnout and unhedged overextension"
    rgt_cite = regret_mem or "Key Regret: Hesitating on transformative upside due to temporary comfort"
    hlt_cite = health_mem or "Core Baseline: Sustained cognitive output requires protected health and sleep architecture"
    decree_high_stakes = "Execute only with verified 6-month liquid runway floor and signed founder covenants before giving notice."

    def clean_citations(*items) -> List[str]:
        return [str(m) for m in items if m and str(m).strip()]

    # Round 1: Opening Arguments
    turns.append({
        "role": "advocate",
        "content": f"Your Honor, regarding '{question}', this is an inflection point that defines the next 3 years. Your core conviction states: '{amb_cite}'. Hesitating out of comfortable fear will lock you in mediocrity.",
        "cited_memories": clean_citations(amb_cite)
    })
    turns.append({
        "role": "skeptic",
        "content": f"Objection to Counsel's reckless romanticism! In your dossier, you recorded '{bnd_cite}'. Leaping without verifiable runway or aligned partners repeats your most catastrophic burnout.",
        "cited_memories": clean_citations(bnd_cite, hlt_cite)
    })
    # Round 2: Judicial Interrogation
    turns.append({
        "role": "judge",
        "content": f"The court intervenes. The stakes here involve existential runway and autonomy. Counsel Advocate, what is the exact downside floor if this hypothesis fails within 6 months?",
        "cited_memories": ["Financial Baselines & Emergency Runway Floor"]
    })
    turns.append({
        "role": "advocate",
        "content": f"Your Honor, the downside floor is protected by establishing a strict 6-month stop-loss milestone. You previously noted '{rgt_cite}'—failing to act when you have the capacity to build guarantees regret.",
        "cited_memories": clean_citations(rgt_cite)
    })
    turns.append({
        "role": "skeptic",
        "content": f"Stop-loss milestones are universally ignored once emotional sunk costs set in! In 2023, you swore you had boundaries, yet arbitrary deadlines consumed your weekends and health completely.",
        "cited_memories": clean_citations(hlt_cite, bnd_cite)
    })
    # Round 3: Evidentiary Cross-Examination
    turns.append({
        "role": "judge",
        "content": f"Counsel Skeptic, is your position that the user must permanently forfeit high-equity ownership, or is there an acceptable governance structure?",
        "cited_memories": ["Equity Ownership vs Corporate Stability"]
    })
    turns.append({
        "role": "skeptic",
        "content": f"The court must demand binding preconditions: minimum 9 months liquid runway floor in reserve, signed vesting and role covenants, and a zero-tolerance clause for recurring weekend firefighting.",
        "cited_memories": clean_citations(bnd_cite)
    })
    turns.append({
        "role": "advocate",
        "content": f"We accept those exact preconditions! That is not a reason to reject the leap—that is the exact charter under which we launch! Boldness paired with contractual rigor is our winning formula.",
        "cited_memories": clean_citations(amb_cite, rgt_cite)
    })
    # Round 4: Closing Arguments (if target_turns >= 11)
    if target_turns >= 11:
        turns.append({
            "role": "skeptic",
            "content": f"Final warning from the defense: do not take a single step forward until those covenants are signed and verified in the bank. Hope is not an operational strategy.",
            "cited_memories": clean_citations(bnd_cite)
        })
        turns.append({
            "role": "advocate",
            "content": f"Final plea for ambition: commit to the covenants, lock in the downside protections, and take the shot. You did not build your skills to play small.",
            "cited_memories": clean_citations(amb_cite)
        })

    # Final Supreme Judicial Verdict
    verdict = "VERDICT: Conditionally Approved—Execute with strict written stop-loss gates, minimum 6-month cash reserve untouched, and binding partner covenants before committing."
    reasoning = "REASONING: The tribunal finds that staying in safe stagnation violates your core constitutional ambition and creates permanent regret. However, executing without explicit downside hedges violates your sacred boundary on burnout and health. Build with hedges, or do not build at all."

    turns.append({
        "role": "judge",
        "content": f"{verdict}\n\n{reasoning}",
        "cited_memories": clean_citations(amb_cite, bnd_cite, rgt_cite, hlt_cite),
        "actionable_decree": decree_high_stakes
    })

    return {
        "turns": turns,
        "advocate": turns[0]["content"],
        "skeptic": turns[1]["content"],
        "judge": turns[-1]["content"],
        "verdict": verdict.replace("VERDICT:", "").strip(),
        "verdict_citations": clean_citations(amb_cite, bnd_cite, rgt_cite, hlt_cite),
        "actionable_decree": decree_high_stakes
    }

async def run_debate(question: str, context_blob: str, memories: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Orchestrates dynamic-length multi-agent debate based on question stakes:
    - 3-4 turns for simple decisions
    - 5-7 turns for moderate decisions
    - 8-12 turns for complex decisions (capped to prevent user fatigue)
    """
    target_turns = determine_debate_depth(question)
    print(f"[Courtroom Engine] Dilemma classified: target_turns = {target_turns} for '{question[:60]}...'")

    # 1. Try ultra-fast NVIDIA NIM if configured
    nim_result = await generate_debate_with_nim(question, context_blob, memories, target_turns)
    if nim_result and "turns" in nim_result and len(nim_result["turns"]) > 0:
        return nim_result

    # 2. Fast grounded dynamic debate engine (matches target_turns with user memories)
    return _generate_grounded_dynamic_debate(question, context_blob, memories, target_turns)
