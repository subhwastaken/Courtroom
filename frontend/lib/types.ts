export type AgentRole = "advocate" | "skeptic" | "judge";

export interface AgentTurn {
  role: AgentRole;
  content: string;
  cited_memories?: string[];
  actionable_decree?: string;
}

export interface DecisionResponse {
  question: string;
  turns: AgentTurn[];
  verdict: string;
  verdict_citations: string[];
  actionable_decree?: string;
}

export interface OutcomeResponse {
  status: string;
  appended: string;
  point_id: string;
  memory_count: number;
}

export interface ProfileResponse {
  raw_markdown: string;
  sections: Record<string, string[]>;
  memory_count: number;
}

export interface MemoryItem {
  id: string;
  score?: number;
  text: string;
  type: string;
  source: string;
  timestamp: string;
}

export interface SynthesizeResponse {
  raw_markdown: string;
  provider: string;
  model: string;
  extracted_memories_count: number;
  memory_count: number;
  status: string;
}

