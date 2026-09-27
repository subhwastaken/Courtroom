# Courtroom Mode � Full Implementation Plan
### Multi-Agent Life-Decision Debate Engine (Omi + Qdrant + Lyzr)

This document is a complete build spec. It is written to be pasted directly into Claude Code as a working prompt. Every section contains enough concrete detail (folder structure, schemas, prompts, endpoint contracts) that an agent can begin scaffolding immediately without needing clarification, except where explicitly marked `[ASK USER]`.

---

## 1. Product Summary

**Courtroom Mode** lets a user speak or type a life decision ("Should I take this job offer?"). The system retrieves relevant personal history from a persistent vector memory (Qdrant), reads a living profile document (`user.md`), and runs a 3-agent debate via Lyzr:

- **Advocate** � argues FOR the action, grounded in the user's own stated values/history
- **Skeptic** � argues AGAINST, grounded the same way, must rebut at least one Advocate point
- **Judge** � reads both arguments, cross-references `user.md` + retrieved memory, delivers a verdict that explicitly cites which past statement/value each point is based on

After the verdict, the user reports what they actually decided. That outcome is appended back into `user.md` and re-embedded into Qdrant � closing the loop so the system gets smarter about the user with every decision run through it.

The UI is a gamified, isometric "courtroom city" dashboard (see Section 7) styled after dark-navy/amber HUD game dashboards � agents are represented as characters/structures in a scene, the debate plays out as a sequential "battle," and the Judge's verdict lands as a dramatic reveal.

---

## 2. Architecture & Tech Stack

| Layer | Technology |
|---|---|
| Frontend | **Next.js 14 (App Router) + TypeScript + TailwindCSS** |
| Backend | **FastAPI (Python 3.11+)** |
| Vector memory | **Qdrant** (cloud or local docker) |
| Multi-agent orchestration | **Lyzr** (Agent Studio / Lyzr SDK) |
| Voice capture | **Omi** (real-time ambient voice capture SDK/device) |
| LLM (used inside Lyzr agents) | Whatever Lyzr's agent studio exposes (OpenAI/Anthropic-compatible) � configure via Lyzr, not called directly unless Lyzr requires a passthrough key |

Communication pattern: **Next.js (client) ? FastAPI (server) ? Qdrant + Lyzr + Omi webhook/ingest**. Next.js never calls Qdrant or Lyzr directly � FastAPI is the single backend of record. This keeps API keys server-side and gives you one place to log/debug the pipeline for your demo video.

---

## 3. High-Level Architecture

```
???????????????????????????????????????????????????????????????????
?                         NEXT.JS FRONTEND                          ?
?  /app                                                              ?
?   ?? /                ? Landing / "Enter Courtroom" scene         ?
?   ?? /courtroom        ? Main isometric debate UI                 ?
?   ?? /profile          ? user.md viewer/editor (read-only-ish)    ?
?   ?? /api/omi-webhook  ? (optional) proxy route if Omi needs one  ?
?????????????????????????????????????????????????????????????????????
                             ? REST (fetch)
?????????????????????????????????????????????????????????????????????
?                          FASTAPI BACKEND                            ?
?  /api/v1                                                            ?
?   ?? POST /transcribe        (Omi voice ? text, if not done client)?
?   ?? POST /decision          (main pipeline trigger)                ?
?   ?? GET  /profile           (return current user.md)               ?
?   ?? POST /profile/outcome   (append decision outcome, re-embed)    ?
?   ?? GET  /memory/search     (debug: raw Qdrant semantic search)    ?
?   ?? GET  /health                                                    ?
?                                                                       ?
?  Services:                                                           ?
?   - qdrant_service.py   (embed + upsert + search)                   ?
?   - lyzr_service.py     (agent orchestration calls)                 ?
?   - omi_service.py      (voice ingestion handling)                  ?
?   - profile_service.py  (user.md read/write/append)                 ?
???????????????????????????????????????????????????????????????????????
            ?                           ?
    ??????????????????         ????????????????????
    ?     QDRANT      ?         ?       LYZR        ?
    ? collection:     ?         ?  3 agents:        ?
    ? user_memories   ?         ?  - advocate        ?
    ? (vectors +      ?         ?  - skeptic         ?
    ?  metadata)      ?         ?  - judge           ?
    ???????????????????         ??????????????????????
            ?
            ? voice transcript ingested as new memory
    ??????????????????
    ?      OMI        ?
    ? real-time voice  ?
    ? capture device/  ?
    ? SDK              ?
    ????????????????????
```

---

## 4. Repository Structure

```
courtroom-mode/
??? frontend/                      # Next.js app
?   ??? app/
?   ?   ??? layout.tsx
?   ?   ??? page.tsx                # Landing scene
?   ?   ??? courtroom/
?   ?   ?   ??? page.tsx            # Main debate UI
?   ?   ??? profile/
?   ?   ?   ??? page.tsx            # user.md viewer
?   ?   ??? globals.css
?   ??? components/
?   ?   ??? scene/
?   ?   ?   ??? IsoStage.tsx        # isometric wrapper (CSS 3D transform)
?   ?   ?   ??? AgentCard.tsx       # advocate/skeptic/judge visual card
?   ?   ?   ??? VerdictGavel.tsx    # verdict reveal animation
?   ?   ?   ??? HUDPanel.tsx        # top HUD bars (mimics screenshot style)
?   ?   ??? VoiceCapture.tsx        # Omi mic trigger + waveform
?   ?   ??? DecisionInput.tsx       # text fallback input
?   ?   ??? DebateLog.tsx           # sequential message reveal
?   ??? lib/
?   ?   ??? api.ts                  # fetch wrappers to FastAPI
?   ?   ??? types.ts                # shared TS types
?   ??? tailwind.config.ts
?   ??? package.json
?   ??? tsconfig.json
?
??? backend/                        # FastAPI app
?   ??? main.py
?   ??? api/
?   ?   ??? decision.py
?   ?   ??? profile.py
?   ?   ??? memory.py
?   ?   ??? voice.py
?   ??? services/
?   ?   ??? qdrant_service.py
?   ?   ??? lyzr_service.py
?   ?   ??? omi_service.py
?   ?   ??? profile_service.py
?   ?   ??? embeddings.py           # embedding model wrapper
?   ??? agents/
?   ?   ??? advocate_prompt.py
?   ?   ??? skeptic_prompt.py
?   ?   ??? judge_prompt.py
?   ??? data/
?   ?   ??? user.md                 # the living profile document
?   ??? models/
?   ?   ??? schemas.py              # Pydantic models
?   ??? requirements.txt
?   ??? .env.example
?
??? seed/
?   ??? seed_memories.py            # script to embed demo memories into Qdrant
?
??? README.md
```

---

## 5. Data Model

### 5.1 `user.md` (living profile � plain markdown, human-readable AND machine-parsed)

```markdown
## Values
- Financial security > prestige
- Wants to move closer to family within 2 years
- Prefers stability over high-risk high-reward moves

## Stated Regrets
- "I regret not negotiating my last salary" (logged 2025-03-02)

## Risk Tolerance
- Self-described as "cautious but tired of playing it safe"

## Past Decisions & Outcomes
- 2025-03-10: Turned down remote role for stability ? regretted it (logged 2025-09-01)
- 2025-06-14: Took a pay cut for better work-life balance ? satisfied (logged 2025-07-01)

## Recent Statements (auto-appended from voice/text)
- 2025-09-20: "I don't want another job where I'm on call every weekend."
```

`profile_service.py` treats each `##` section as a structured block. New outcomes are appended under "Past Decisions & Outcomes"; new voice snippets are appended under "Recent Statements." The whole file is re-read and re-chunked into Qdrant after every write.

### 5.2 Qdrant collection: `user_memories`

Each point:
```json
{
  "id": "uuid",
  "vector": [ ...embedding... ],
  "payload": {
    "text": "I regret not negotiating my last salary",
    "type": "regret | value | decision_outcome | voice_statement",
    "timestamp": "2025-09-20T14:00:00Z",
    "source": "user.md | voice | manual"
  }
}
```

Vector size depends on chosen embedding model (e.g. 1536 for OpenAI `text-embedding-3-small`, or use a local model if avoiding extra API dependency � see Section 9 for a no-extra-key option).

### 5.3 FastAPI Pydantic schemas (`models/schemas.py`)

```python
from pydantic import BaseModel
from typing import Literal, Optional

class DecisionRequest(BaseModel):
    question: str
    source: Literal["voice", "text"] = "text"

class AgentTurn(BaseModel):
    role: Literal["advocate", "skeptic", "judge"]
    content: str
    cited_memories: list[str] = []

class DecisionResponse(BaseModel):
    question: str
    turns: list[AgentTurn]
    verdict: str
    verdict_citations: list[str]

class OutcomeRequest(BaseModel):
    question: str
    actual_decision: str
    reflection: Optional[str] = None
```

---

## 6. Backend Implementation Detail

### 6.1 `qdrant_service.py`

Responsibilities:
- `ensure_collection()` � create `user_memories` collection on startup if not exists
- `embed_text(text: str) -> list[float]` � wraps embedding call
- `upsert_memory(text, type, source)` � embeds + upserts a point
- `search_memories(query: str, top_k: int = 5) -> list[dict]` � semantic search, returns payloads sorted by score

```python
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
import uuid, os

client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))
COLLECTION = "user_memories"

def ensure_collection(vector_size: int = 1536):
    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION not in collections:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=qmodels.VectorParams(size=vector_size, distance=qmodels.Distance.COSINE),
        )

def upsert_memory(text: str, mem_type: str, source: str, embed_fn, timestamp: str):
    vector = embed_fn(text)
    client.upsert(
        collection_name=COLLECTION,
        points=[qmodels.PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"text": text, "type": mem_type, "source": source, "timestamp": timestamp}
        )]
    )

def search_memories(query: str, embed_fn, top_k: int = 5):
    vector = embed_fn(query)
    results = client.search(collection_name=COLLECTION, query_vector=vector, limit=top_k)
    return [r.payload for r in results]
```

### 6.2 `lyzr_service.py`

Responsibilities:
- Build the shared context blob (user.md + retrieved memories + question)
- Call Lyzr's agent endpoints in sequence: advocate ? skeptic ? judge
- Parse each response into `AgentTurn`

Lyzr integration pattern (managed-agent REST call):

```python
import httpx, os

LYZR_API_KEY = os.getenv("LYZR_API_KEY")
LYZR_BASE_URL = os.getenv("LYZR_BASE_URL", "https://api.lyzr.ai/v1")

async def call_agent(agent_id: str, system_prompt: str, user_message: str) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{LYZR_BASE_URL}/agents/{agent_id}/chat",
            headers={"Authorization": f"Bearer {LYZR_API_KEY}"},
            json={
                "system_prompt": system_prompt,
                "message": user_message,
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        return resp.json()["response"]

async def run_debate(question: str, context_blob: str) -> dict:
    advocate_reply = await call_agent(
        os.getenv("LYZR_ADVOCATE_AGENT_ID"),
        ADVOCATE_SYSTEM_PROMPT,
        f"CONTEXT:\n{context_blob}\n\nQUESTION: {question}"
    )
    skeptic_reply = await call_agent(
        os.getenv("LYZR_SKEPTIC_AGENT_ID"),
        SKEPTIC_SYSTEM_PROMPT,
        f"CONTEXT:\n{context_blob}\n\nQUESTION: {question}\n\nADVOCATE ARGUED:\n{advocate_reply}"
    )
    judge_reply = await call_agent(
        os.getenv("LYZR_JUDGE_AGENT_ID"),
        JUDGE_SYSTEM_PROMPT,
        f"CONTEXT:\n{context_blob}\n\nQUESTION: {question}\n\nADVOCATE:\n{advocate_reply}\n\nSKEPTIC:\n{skeptic_reply}"
    )
    return {"advocate": advocate_reply, "skeptic": skeptic_reply, "judge": judge_reply}
```

> **Architecture Note:** Lyzr supports both sequential multi-agent execution (Advocate -> Skeptic -> Chief Justice) or a single orchestrator Manager Agent.

### 6.3 Agent system prompts

**`agents/advocate_prompt.py`**
```python
ADVOCATE_SYSTEM_PROMPT = """You are the Advocate in a personal decision-making courtroom.
Your job: build the strongest possible case FOR the action the user is considering.

Rules:
- Every point you make must be grounded in something specific from the CONTEXT provided
  (the user's stated values, past decisions, or retrieved memories). Quote or closely
  paraphrase the specific memory you're using.
- Do not give generic advice. If you can't ground a point in the user's own context, don't make it.
- Keep it to 3-4 sharp points, not a wall of text.
- End with one sentence stating your overall position clearly.
- Format: plain text, no markdown headers.
"""
```

**`agents/skeptic_prompt.py`**
```python
SKEPTIC_SYSTEM_PROMPT = """You are the Skeptic in a personal decision-making courtroom.
Your job: build the strongest possible case AGAINST the action, using the same rules as the Advocate.

Rules:
- Every point must be grounded in the user's own CONTEXT (values, past regrets, past outcomes).
- You MUST directly rebut at least one specific point the Advocate made � name it and explain
  why it doesn't hold up given the user's actual history.
- Keep it to 3-4 sharp points.
- End with one sentence stating your overall position clearly.
- Format: plain text, no markdown headers.
"""
```

**`agents/judge_prompt.py`**
```python
JUDGE_SYSTEM_PROMPT = """You are the Judge in a personal decision-making courtroom.
You have read the Advocate's and Skeptic's arguments. Your job is to deliver a verdict.

Rules:
- Weigh both arguments against the user's own CONTEXT � not against generic good advice.
- For every point in your reasoning, explicitly cite which specific past statement, value,
  or outcome from the user's history it is based on. Use a format like:
  "Given that you said '[memory]', ..."
- If both agents missed something present in the CONTEXT that's relevant, raise it yourself.
- Deliver a clear final verdict: what the user should most likely do, and why, in terms of
  what would make sense FOR THIS SPECIFIC PERSON � not generic advice.
- Structure your response as:
  VERDICT: <one-line verdict>
  REASONING: <2-4 sentences, each citing a specific memory/value>
"""
```

### 6.4 `POST /api/v1/decision` endpoint (`api/decision.py`)

```python
from fastapi import APIRouter
from models.schemas import DecisionRequest, DecisionResponse, AgentTurn
from services import qdrant_service, lyzr_service, profile_service, embeddings

router = APIRouter()

@router.post("/decision", response_model=DecisionResponse)
async def make_decision(req: DecisionRequest):
    # 1. Retrieve relevant memories
    memories = qdrant_service.search_memories(req.question, embeddings.embed_text, top_k=6)

    # 2. Load user.md
    profile_text = profile_service.load_profile()

    # 3. Build shared context blob
    context_blob = profile_service.build_context_blob(profile_text, memories)

    # 4. Run the debate
    result = await lyzr_service.run_debate(req.question, context_blob)

    # 5. Parse judge output into verdict + citations
    verdict, citations = profile_service.parse_judge_output(result["judge"])

    turns = [
        AgentTurn(role="advocate", content=result["advocate"]),
        AgentTurn(role="skeptic", content=result["skeptic"]),
        AgentTurn(role="judge", content=result["judge"], cited_memories=citations),
    ]

    return DecisionResponse(
        question=req.question,
        turns=turns,
        verdict=verdict,
        verdict_citations=citations,
    )
```

### 6.5 `POST /api/v1/profile/outcome` endpoint (`api/profile.py`)

```python
from fastapi import APIRouter
from models.schemas import OutcomeRequest
from services import profile_service, qdrant_service, embeddings
from datetime import datetime

router = APIRouter()

@router.post("/profile/outcome")
async def log_outcome(req: OutcomeRequest):
    entry = f"{req.question} ? decided: {req.actual_decision}"
    if req.reflection:
        entry += f" (reflection: {req.reflection})"

    profile_service.append_to_section("Past Decisions & Outcomes", entry)

    qdrant_service.upsert_memory(
        text=entry,
        mem_type="decision_outcome",
        source="user.md",
        embed_fn=embeddings.embed_text,
        timestamp=datetime.utcnow().isoformat(),
    )

    return {"status": "ok", "appended": entry}
```

### 6.6 `omi_service.py` � voice ingestion

Two integration paths depending on what the Omi starter kit provides:

**Path A (webhook push):** Omi device/app pushes transcripts to a webhook as they happen.
```python
# api/voice.py
from fastapi import APIRouter, Request
from services import qdrant_service, embeddings, profile_service
from datetime import datetime

router = APIRouter()

@router.post("/voice/webhook")
async def omi_webhook(request: Request):
    payload = await request.json()
    transcript = payload.get("transcript") or payload.get("text")
    if not transcript:
        return {"status": "ignored"}

    profile_service.append_to_section("Recent Statements", transcript)
    qdrant_service.upsert_memory(
        text=transcript,
        mem_type="voice_statement",
        source="voice",
        embed_fn=embeddings.embed_text,
        timestamp=datetime.utcnow().isoformat(),
    )
    return {"status": "ingested"}
```

**Path B (client SDK):** Omi's SDK runs in-browser/app and returns transcript text directly to the frontend, which then POSTs it to your own `/decision` or a lightweight `/voice/ingest` endpoint (same body as above, just called from `VoiceCapture.tsx` instead of an external webhook).

> **Voice Ingestion Note:** The backend supports both real-time webhook ingestion from Omi or browser Web Speech API directly in VoiceCapture.tsx.

### 6.7 `embeddings.py`

To minimize new API dependencies, two options:

- **Option 1 (simplest):** Use OpenAI's `text-embedding-3-small` if you already have an OpenAI key in your environment.
- **Option 2 (zero extra key):** Use a local sentence-transformers model (`all-MiniLM-L6-v2`, 384-dim) via the `sentence-transformers` Python package � no API key needed, runs on CPU fine for a demo-sized dataset.

```python
# Option 2 � no external key required
from sentence_transformers import SentenceTransformer

_model = SentenceTransformer("all-MiniLM-L6-v2")

def embed_text(text: str) -> list[float]:
    return _model.encode(text).tolist()
```

If using Option 2, set Qdrant's `vector_size=384` instead of 1536 in `ensure_collection()`.

### 6.8 `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import decision, profile, memory, voice
from services import qdrant_service

app = FastAPI(title="Courtroom Mode API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    qdrant_service.ensure_collection(vector_size=384)  # or 1536 if using OpenAI embeddings

app.include_router(decision.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(memory.router, prefix="/api/v1")
app.include_router(voice.router, prefix="/api/v1")

@app.get("/api/v1/health")
def health():
    return {"status": "ok"}
```

### 6.9 `requirements.txt`

```
fastapi
uvicorn[standard]
qdrant-client
httpx
pydantic
python-dotenv
sentence-transformers
python-multipart
```

### 6.10 `.env.example`

```
QDRANT_URL=
QDRANT_API_KEY=
LYZR_API_KEY=
LYZR_BASE_URL=
LYZR_ADVOCATE_AGENT_ID=
LYZR_SKEPTIC_AGENT_ID=
LYZR_JUDGE_AGENT_ID=
OMI_API_KEY=
```

---

## 7. Frontend Implementation Detail

### 7.1 Visual direction (mimicking the reference screenshot)

The reference image is a dark-navy isometric city-builder HUD (glassy translucent panels, amber/gold accent buttons, monospace uppercase labels, small stat badges, "LIVE" indicators). Apply that same visual language to the courtroom scene:

- **Background:** deep navy-to-black gradient, subtle grid texture
- **HUD panels:** translucent dark panels (`bg-slate-900/80 backdrop-blur border border-amber-500/30`), pinned to corners, showing things like "CASE LIVE," "MEMORIES SYNCED: 12," "SIGN IN"
- **Center stage:** an isometric "courtroom" built from simple 3D-transformed divs (see 7.2) � three podiums arranged in a triangle (Advocate left, Skeptic right, Judge center-back, slightly elevated)
- **Agent representation:** each agent is a card/avatar that "lights up" (glow + scale-up) when it's their turn to speak, others dim to 60% opacity
- **Accent color:** amber/gold (`#f59e0b` range) for primary actions and highlights, consistent with the screenshot's "SNAP," "ASK MAYOR," "DISPATCH" buttons
- **Typography:** uppercase, tracked-out, monospace/condensed font for labels (Tailwind: `tracking-widest uppercase font-mono text-xs`)

This gets you 80% of the "3D gamified" visual impression from the screenshot using pure CSS, no 3D engine, no asset sourcing � realistic for tonight.

### 7.2 `IsoStage.tsx` � CSS-based isometric wrapper

```tsx
export function IsoStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
      <div
        className="relative"
        style={{
          transform: "rotateX(55deg) rotateZ(45deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

Each `AgentCard` inside can counter-rotate (`rotateZ(-45deg) rotateX(-55deg)`) so its text stays readable while still sitting on the isometric "floor" � this is the standard trick for CSS isometric UIs.

### 7.3 `AgentCard.tsx`

```tsx
type Props = {
  role: "advocate" | "skeptic" | "judge";
  content: string;
  active: boolean;
  citedMemories?: string[];
};

export function AgentCard({ role, content, active, citedMemories }: Props) {
  const colorMap = {
    advocate: "border-emerald-500/50 shadow-emerald-500/20",
    skeptic: "border-rose-500/50 shadow-rose-500/20",
    judge: "border-amber-500/50 shadow-amber-500/20",
  };

  return (
    <div
      className={`
        w-72 rounded-lg border bg-slate-900/90 backdrop-blur p-4
        transition-all duration-500
        ${colorMap[role]}
        ${active ? "scale-105 opacity-100 shadow-lg" : "opacity-50 scale-95"}
      `}
      style={{ transform: "rotateZ(-45deg) rotateX(-55deg)" }}
    >
      <div className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">
        {role}
      </div>
      <p className="text-sm text-slate-100 leading-relaxed">{content}</p>
      {citedMemories && citedMemories.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-700 text-[10px] text-amber-400 font-mono">
          CITED: {citedMemories.join(" � ")}
        </div>
      )}
    </div>
  );
}
```

### 7.4 `HUDPanel.tsx` (top corner status bars, mimicking screenshot)

```tsx
export function HUDPanel({ label, value, live = false }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="fixed top-4 left-4 z-20 bg-slate-900/80 backdrop-blur border border-amber-500/30 rounded-md px-4 py-2 font-mono">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-400">
        {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        {label}
      </div>
      <div className="text-sm text-slate-100 mt-1">{value}</div>
    </div>
  );
}
```

Use several of these pinned around the screen: "CASE LIVE," "MEMORIES SYNCED: {count}," "PROFILE: {name}."

### 7.5 `courtroom/page.tsx` � main flow

```tsx
"use client";
import { useState } from "react";
import { IsoStage } from "@/components/scene/IsoStage";
import { AgentCard } from "@/components/scene/AgentCard";
import { HUDPanel } from "@/components/scene/HUDPanel";
import { DecisionInput } from "@/components/DecisionInput";
import { VoiceCapture } from "@/components/VoiceCapture";
import { runDecision, logOutcome } from "@/lib/api";
import type { DecisionResponse } from "@/lib/types";

export default function CourtroomPage() {
  const [result, setResult] = useState<DecisionResponse | null>(null);
  const [activeTurn, setActiveTurn] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleAsk(question: string) {
    setLoading(true);
    const res = await runDecision(question);
    setResult(res);
    setActiveTurn(0);
    setLoading(false);
    // reveal turns sequentially for the "battle" effect
    res.turns.forEach((_, i) => {
      setTimeout(() => setActiveTurn(i + 1), (i + 1) * 1800);
    });
  }

  return (
    <main className="relative min-h-screen bg-slate-950">
      <HUDPanel label="Case" live value={result ? "In Session" : "Awaiting Question"} />
      <HUDPanel label="Memories Synced" value="12" />

      <IsoStage>
        <div className="flex gap-12">
          {result?.turns.slice(0, activeTurn).map((turn, i) => (
            <AgentCard
              key={i}
              role={turn.role}
              content={turn.content}
              active={i === activeTurn - 1}
              citedMemories={turn.cited_memories}
            />
          ))}
        </div>
      </IsoStage>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <DecisionInput onSubmit={handleAsk} disabled={loading} />
        <VoiceCapture onTranscript={handleAsk} />
      </div>

      {result && activeTurn >= result.turns.length && (
        <OutcomePrompt question={result.question} onLog={logOutcome} />
      )}
    </main>
  );
}
```

### 7.6 `lib/api.ts`

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api/v1";

export async function runDecision(question: string) {
  const res = await fetch(`${API_BASE}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, source: "text" }),
  });
  return res.json();
}

export async function logOutcome(question: string, actual_decision: string, reflection?: string) {
  const res = await fetch(`${API_BASE}/profile/outcome`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, actual_decision, reflection }),
  });
  return res.json();
}
```

### 7.7 `VoiceCapture.tsx`

Wire to whichever Omi SDK entry point the starter kit provides. Generic shape:

```tsx
"use client";
import { useState } from "react";
// import { OmiClient } from "omi-sdk"; // adjust to actual package name from starter kit

export function VoiceCapture({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false);

  async function startCapture() {
    setListening(true);
    // Pseudocode � replace with actual Omi SDK call from starter kit docs:
    // const transcript = await OmiClient.captureUntilSilence();
    // onTranscript(transcript);
    setListening(false);
  }

  return (
    <button
      onClick={startCapture}
      className="px-4 py-2 rounded-md bg-amber-500 text-slate-900 font-mono text-xs uppercase tracking-widest hover:bg-amber-400"
    >
      {listening ? "Listening..." : "Speak Your Case"}
    </button>
  );
}
```

> **Omi Note:** Omi audio streams to the webhook endpoint or directly through browser-level speech recognition.

---

## 8. Seed Data Script (`seed/seed_memories.py`)

Run this once before your demo so the retrieval has something meaningful to surface.

```python
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from services import qdrant_service, embeddings
from datetime import datetime

qdrant_service.ensure_collection(vector_size=384)

seed_memories = [
    ("I regret not negotiating my last salary", "regret"),
    ("Financial security matters more to me than prestige", "value"),
    ("I want to move closer to my family within the next two years", "value"),
    ("I turned down a remote role for stability and regretted it", "decision_outcome"),
    ("I took a pay cut once for better work-life balance and was satisfied", "decision_outcome"),
    ("I don't want another job where I'm on call every weekend", "voice_statement"),
    ("I described myself as cautious but tired of playing it safe", "value"),
]

for text, mem_type in seed_memories:
    qdrant_service.upsert_memory(
        text=text,
        mem_type=mem_type,
        source="seed",
        embed_fn=embeddings.embed_text,
        timestamp=datetime.utcnow().isoformat(),
    )

print(f"Seeded {len(seed_memories)} memories.")
```

Run before demo:
```bash
cd seed && python seed_memories.py
```

---

## 9. Build Order (execute in this sequence)

1. **Scaffold repos** � Next.js app (`npx create-next-app@latest frontend --typescript --tailwind --app`) and FastAPI app (`backend/` with structure from Section 4).
2. **Qdrant up** � spin up Qdrant (docker or cloud), confirm connection with a health check script.
3. **Embeddings working** � get `embeddings.py` returning vectors (use Option 2 / sentence-transformers to avoid extra key setup delay).
4. **Seed Qdrant** � run `seed_memories.py`, confirm via `GET /memory/search?q=salary` returns the salary regret memory.
5. **`user.md` + profile_service** � implement load/append/build_context_blob functions, test in isolation.
6. **Lyzr agents** � create the 3 agents (advocate/skeptic/judge) in Lyzr Studio using the prompts from Section 6.3, grab their agent IDs, wire `lyzr_service.py`. Test `run_debate()` with a hardcoded question + context via a script before touching the API layer.
7. **`/decision` endpoint** � wire everything together, test via curl/Postman with a plain question, confirm advocate/skeptic/judge all return sensible grounded text.
8. **`/profile/outcome` endpoint** � test the feedback loop: log an outcome, re-run `/memory/search` and confirm the new memory is retrievable.
9. **Frontend scaffolding** � build `IsoStage`, `AgentCard`, `HUDPanel` first as static components with dummy data, get the visual style right before wiring real data.
10. **Wire `/decision` into frontend** � `DecisionInput` ? `runDecision()` ? sequential reveal via `activeTurn` state.
11. **Wire outcome logging UI** � simple prompt/modal after verdict reveal.
12. **Voice last** � wire `VoiceCapture.tsx` to the actual Omi SDK only once everything above works via text input. This is the highest-risk integration; de-risking it last means a text-only fallback still gives you a complete, demoable product if Omi setup runs long.
13. **Polish pass** � animations (fade/scale transitions already in `AgentCard`), HUD panel copy, background gradient, favicon/branding.
14. **Record demo video** � script: ask a real question ? watch agents disagree ? judge cites specific memory ? log outcome ? show `user.md`/memory count updating.

---

## 10. Interactive Walkthrough Flow

1. Open the courtroom UI � HUD shows "MEMORIES SYNCED: 7" (from seed data)
2. Speak or type: *"Should I take a new job that pays more but requires being on-call every weekend?"*
3. Advocate card lights up, argues for the money � cites a grounded value
4. Skeptic card lights up, directly rebuts one Advocate point, cites the "on-call" voice statement and the past regret memory
5. Judge card delivers verdict: clear recommendation + 2-3 citations to specific past statements
6. Outcome prompt appears: user types what they actually chose
7. Cut to `user.md` / memory count HUD panel updating live � "MEMORIES SYNCED: 8"
8. Close on: "Courtroom Mode doesn't give generic advice � it argues with your own history."


---

## 11. Configuration & Deployment Notes

- `[ASK USER]` Exact Lyzr call pattern (direct multi-agent calls vs. single manager agent) � check platform docs
- `[ASK USER]` Omi integration mode (webhook vs. client SDK) and exact package/init code
- Qdrant supports both cloud cluster URL and local zero-dependency storage.
- `[ASK USER]` Confirm embedding approach � if OpenAI credits are provided as part of "developer tier credits," Option 1 (OpenAI embeddings) may give slightly better retrieval quality than Option 2; otherwise Option 2 avoids setup friction

Everything else in this document is safe to build against as-is.
