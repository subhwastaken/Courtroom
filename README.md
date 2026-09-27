# ⚖️ Courtroom — Autonomous Multi-Agent Decision Engine
### *The personal decision engine that doesn’t give generic advice — it argues with your own history.*

---

## 🏛️ Overview

Standard AI life advice is often generic: it gives cookie-cutter platitudes without knowing who you are, what values you hold, or what has burned you in the past. 

**Courtroom** solves this by creating an autonomous 3-tier deliberation chamber that debates your real-life choices against your personal track record:

1. **The Advocate** (*Counsel for Opportunity*): Argues aggressively **FOR** taking the action, strictly quoting and citing your stated values and past regrets of hesitation or inaction.
2. **The Skeptic** (*Counsel for Caution*): Argues aggressively **AGAINST**, directly rebutting the Advocate’s points and citing hard personal boundaries or painful past experiences from your history.
3. **The Chief Justice** (*Arbiter of History*): Evaluates both arguments against your living profile (`user.md`) and vector memory bank, strikes the gavel, and delivers a definitive verdict with explicit personal citations.

After the verdict, you record your actual choice. That choice is automatically written to `user.md` and re-embedded into **Qdrant**—closing the feedback loop so the system gets sharper with every decision you face.

---

## 🛠️ Architecture & Tech Stack

| Component | Technology | Role |
|---|---|---|
| **Frontend** | **Next.js 14 + Three.js + Pixel-Art UI** | Interactive 3D isometric courtroom diorama & 2D office view. Features authentic character billboard sprites, dynamic spotlights, animated rebuttal beams, speech bubbles, and step-by-step playback controls. |
| **Backend** | **FastAPI (Python 3.10+)** | Async REST backend orchestrating vector memory retrieval, multi-agent debate pipelines, voice webhook ingestion, and living profile persistence. |
| **Vector DB** | **Qdrant** (`user_memories` collection) | Stores and ranks personal memories, regrets, and historical outcomes using dense semantic vectors with cosine similarity. |
| **Multi-Agent Engine** | **Lyzr Agent Studio** | 3-agent adversarial deliberation pipeline (Advocate → Skeptic → Chief Justice) with contextual memory grounding. |
| **Voice Ingestion** | **Omi** | Real-time ambient audio capture and transcription via webhook and browser-based voice input. |
| **Embeddings** | **sentence-transformers (`all-MiniLM-L6-v2`) / OpenAI** | Dense semantic embeddings with zero external API key requirements out-of-the-box. |

---

## 🏗️ Closed-Loop Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 14 FRONTEND                             │
│   • /               → Landing Portal & Architecture Overview           │
│   • /courtroom      → 3D Isometric Chamber (Advocate/Skeptic/Judge)    │
│   • /profile        → Living Profile (user.md) & Vector Search Explorer│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API
┌───────────────────────────────────▼────────────────────────────────────┐
│                        FASTAPI BACKEND                                 │
│   • POST /api/v1/decision        → Trigger 3-agent courtroom debate    │
│   • POST /api/v1/profile/outcome → Append choice & re-embed to Qdrant  │
│   • GET  /api/v1/profile         → Read living user.md profile         │
│   • GET  /api/v1/memory/search   → Real-time semantic memory retrieval │
│   • POST /api/v1/voice/ingest    → Ambient voice statement ingestion   │
└───────────────┬──────────────────────────────────────────┬─────────────┘
                │ Semantic Search / Upsert                 │ Multi-Agent
┌───────────────▼────────────────┐         ┌───────────────▼─────────────┐
│       QDRANT VECTOR DB         │         │      LYZR AGENT STUDIO      │
│  Collection: `user_memories`   │         │  1. Advocate (Opportunity)  │
│  • Core values                 │         │  2. Skeptic  (Caution)      │
│  • Stated regrets              │         │  3. Chief Justice (Verdict) │
│  • Historical outcomes         │         └─────────────────────────────┘
│  • Real-time voice statements  │
└────────────────────────────────┘
```

---

## ⚡ Quick Start

### 1. Backend Setup

The backend runs on Python 3.10+ with FastAPI:

```bash
cd backend

# Option A: Run directly with pre-configured virtual environment
~/.venvs/courtroom/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Option B: Standard virtualenv setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Verify backend health:
```bash
curl http://localhost:8000/api/v1/health
# Response: {"status":"healthy","system":"Courtroom Backend","memories_synced":8,...}
```

### 2. Seed Initial Memories (Starter Data)

Populate your Qdrant vector database with starter core values, regrets, and career outcomes:
```bash
cd seed
python3 seed_memories.py
```

### 3. Frontend Setup

The frontend runs on Next.js 14:
```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser:
- **`http://localhost:3000/`** → Landing portal
- **`http://localhost:3000/courtroom`** → 3D isometric deliberation chamber
- **`http://localhost:3000/profile`** → Living identity profile and vector memory search explorer

---

## 🎬 How Deliberation Works

1. **Chamber Overview**:
   - Open `/courtroom`. The top HUD tracks active chamber status and vector memory count.
   - The 3D isometric chamber presents three stations: Advocate (left), Chief Justice (center elevated), and Skeptic (right).
2. **State Dilemma**:
   - Enter your real dilemma (e.g. *"Should I take a new role that pays more but requires being on-call every weekend?"*) or click **"Speak Your Case"** to dictate it via mic.
   - Click **Convene**.
3. **The Courtroom Battle**:
   - **Advocate lights up (Emerald aura)**: Argues for the upside, quoting: *"I regret not negotiating my last salary"* and *"tired of playing it safe"*.
   - **Skeptic lights up (Rose aura)**: Counter-argues directly, citing: *"I don't want another job where I'm on call every weekend"* and past satisfaction with work-life balance.
4. **The Verdict**:
   - **Gavel strikes**: Chief Justice issues the ruling citing grounded memories from your past.
5. **Close the Loop**:
   - In the "Close The Loop" section, enter what you decided: e.g. *"Declined weekend on-call offer, opted for flexible consulting hours."*
   - Click **Commit To Memory**.
   - The memory counter updates, and the outcome is written to `user.md` and indexed into Qdrant for all future trials.

---

## 🔒 Configuration (`.env`)

In `backend/.env`:
```env
# Optional remote Qdrant (leave blank to use embedded local Qdrant engine)
QDRANT_URL=
QDRANT_API_KEY=

# Lyzr Agent Studio Keys (leave blank to run in offline grounded fallback mode)
LYZR_API_KEY=
LYZR_BASE_URL=https://agent-prod.studio.lyzr.ai/v3/inference/chat/
LYZR_ADVOCATE_AGENT_ID=
LYZR_SKEPTIC_AGENT_ID=
LYZR_JUDGE_AGENT_ID=

# Omi Key
OMI_API_KEY=

# Embedding Provider (sentence-transformers or openai)
EMBEDDING_PROVIDER=sentence-transformers
```
