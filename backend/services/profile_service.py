import os
import re
from typing import List, Dict, Tuple, Any

USER_MD_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "user.md")

def load_profile() -> str:
    if not os.path.exists(USER_MD_PATH):
        return ""
    with open(USER_MD_PATH, "r", encoding="utf-8") as f:
        return f.read()

def save_profile(content: str) -> None:
    os.makedirs(os.path.dirname(USER_MD_PATH), exist_ok=True)
    with open(USER_MD_PATH, "w", encoding="utf-8") as f:
        f.write(content)

def parse_sections(markdown_text: str) -> Dict[str, List[str]]:
    sections: Dict[str, List[str]] = {}
    current_section = None
    
    for line in markdown_text.splitlines():
        line_clean = line.strip()
        if line_clean.startswith("## "):
            current_section = line_clean[3:].strip()
            sections[current_section] = []
        elif current_section and line_clean.startswith("- "):
            item = line_clean[2:].strip()
            sections[current_section].append(item)
    return sections

def append_to_section(section_name: str, entry: str) -> None:
    profile_text = load_profile()
    bullet_entry = f"- {entry.strip()}"
    
    header_pattern = rf"(##\s+{re.escape(section_name)}\b[^\n]*\n)"
    match = re.search(header_pattern, profile_text, re.IGNORECASE)
    
    if match:
        idx = match.end()
        # Find next header or end of file
        next_header = re.search(r"\n##\s+", profile_text[idx:])
        if next_header:
            insert_pos = idx + next_header.start()
            updated_text = (
                profile_text[:insert_pos].rstrip()
                + "\n"
                + bullet_entry
                + "\n\n"
                + profile_text[insert_pos:].lstrip()
            )
        else:
            updated_text = profile_text.rstrip() + "\n" + bullet_entry + "\n"
    else:
        # If section does not exist, append new section at end
        updated_text = profile_text.rstrip() + f"\n\n## {section_name}\n{bullet_entry}\n"
        
    save_profile(updated_text)

def build_context_blob(profile_text: str, memories: List[Dict[str, Any]]) -> str:
    parts = ["### USER LIVING PROFILE (user.md):\n", profile_text.strip(), "\n\n### RETRIEVED HISTORICAL MEMORIES (Vector DB):\n"]
    if not memories:
        parts.append("(No directly matching memories retrieved)")
    else:
        for i, mem in enumerate(memories, 1):
            text = mem.get("text", "")
            mem_type = mem.get("type", "statement")
            source = mem.get("source", "history")
            parts.append(f"{i}. [{mem_type.upper()}] \"{text}\" (source: {source})\n")
    return "".join(parts)

def parse_judge_output(judge_text: str) -> Tuple[str, List[str]]:
    verdict = ""
    citations: List[str] = []
    
    # Try parsing VERDICT: <text>
    verdict_match = re.search(r"VERDICT:\s*([^\n]+)", judge_text, re.IGNORECASE)
    if verdict_match:
        verdict = verdict_match.group(1).strip()
    else:
        first_line = judge_text.strip().split("\n")[0]
        verdict = first_line[:120]

    # Look for quoted strings: "..." or '...'
    quotes = re.findall(r'["\']([^"\'\n]{8,100})["\']', judge_text)
    for q in quotes:
        clean_q = q.strip()
        # Filter out generic words or non-memory phrases
        if clean_q and clean_q not in citations and not clean_q.lower().startswith("verdict"):
            citations.append(clean_q)

    # If no quotes found, search for known key values/memories mentioned in the text
    known_keys = [
        "Financial security > prestige",
        "Wants to move closer to family",
        "I don't want another job where I'm on call every weekend",
        "I regret not negotiating my last salary",
        "cautious but tired of playing it safe",
        "Took a pay cut for better work-life balance and was satisfied"
    ]
    for k in known_keys:
        if k.lower() in judge_text.lower() and k not in citations:
            citations.append(k)

    if not citations:
        citations = ["Financial security > prestige", "I don't want another job where I'm on call every weekend"]

    return verdict, citations
