from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any

class DecisionRequest(BaseModel):
    question: str
    source: Literal["voice", "text"] = "text"

class AgentTurn(BaseModel):
    role: Literal["advocate", "skeptic", "judge"]
    content: str
    cited_memories: List[str] = []
    actionable_decree: Optional[str] = None

class DecisionResponse(BaseModel):
    question: str
    turns: List[AgentTurn]
    verdict: str
    verdict_citations: List[str]
    actionable_decree: Optional[str] = None

class OutcomeRequest(BaseModel):
    question: str
    actual_decision: str
    reflection: Optional[str] = None

class MemorySearchResponse(BaseModel):
    query: str
    count: int
    results: List[Dict[str, Any]]

class ProfileResponse(BaseModel):
    raw_markdown: str
    sections: Dict[str, List[str]]
    memory_count: int

class VoiceIngestRequest(BaseModel):
    transcript: str
    source: str = "voice"

class SynthesizeRequest(BaseModel):
    input_text: str
    mode: Literal["replace", "append"] = "replace"
    user_name: Optional[str] = "User"
    sync_to_qdrant: bool = True
    nvidia_api_key: Optional[str] = None

class SynthesizeResponse(BaseModel):
    raw_markdown: str
    provider: str
    model: str
    extracted_memories_count: int
    memory_count: int
    status: str = "ok"

class KeyConfigRequest(BaseModel):
    nvidia_api_key: str
