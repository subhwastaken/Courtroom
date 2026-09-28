import { DecisionResponse, OutcomeResponse, ProfileResponse, MemoryItem, SynthesizeResponse } from "./types";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api/v1";
}

export async function synthesizeProfile(
  inputText: string,
  mode: "replace" | "append" = "replace",
  userName = "User",
  syncToQdrant = true,
  nvidiaApiKey?: string
): Promise<SynthesizeResponse> {
  const res = await fetch(`${getApiBase()}/profile/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input_text: inputText,
      mode,
      user_name: userName,
      sync_to_qdrant: syncToQdrant,
      nvidia_api_key: nvidiaApiKey || undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Synthesis failed" }));
    throw new Error(err.detail || "Failed to synthesize dossier");
  }
  return res.json();
}

export async function fetchSynthesizerStatus(): Promise<{
  has_nvidia_key: boolean;
  nvidia_model: string;
  has_lyzr: boolean;
  primary_provider: string;
}> {
  try {
    const res = await fetch(`${getApiBase()}/profile/synthesizer-status`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return {
      has_nvidia_key: false,
      nvidia_model: "meta/llama-3.2-11b-vision-instruct",
      has_lyzr: true,
      primary_provider: "nvidia-nim",
    };
  }
}

export async function saveNvidiaKey(nvidiaApiKey: string): Promise<{ status: string; message: string }> {
  const res = await fetch(`${getApiBase()}/profile/config-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nvidia_api_key: nvidiaApiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to save key" }));
    throw new Error(err.detail || "Failed to save API key");
  }
  return res.json();
}

export async function runDecision(question: string): Promise<DecisionResponse> {
  const endpoints = [
    `${getApiBase()}/decision`,
    "http://localhost:8000/api/v1/decision",
    "http://127.0.0.1:8000/api/v1/decision",
  ];

  let lastErr: any = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, source: "text" }),
      });
      if (res.ok) {
        return await res.json();
      }
      const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
      lastErr = new Error(err.detail || `Decision engine error (${res.status})`);
    } catch (e: any) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Failed to evaluate decision across all endpoints");
}

export async function logOutcome(
  question: string,
  actual_decision: string,
  reflection?: string
): Promise<OutcomeResponse> {
  const res = await fetch(`${getApiBase()}/profile/outcome`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, actual_decision, reflection }),
  });
  if (!res.ok) {
    throw new Error("Failed to log outcome");
  }
  return res.json();
}

export async function fetchProfile(): Promise<ProfileResponse> {
  const endpoints = [
    `${getApiBase()}/profile`,
    "http://localhost:8000/api/v1/profile",
    "http://127.0.0.1:8000/api/v1/profile",
  ];

  let lastErr: any = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
      lastErr = new Error(`Endpoint ${url} returned status ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Unable to connect to profile server");
}

export async function updateProfile(raw_markdown: string): Promise<{ status: string }> {
  const endpoints = [
    `${getApiBase()}/profile`,
    "http://localhost:8000/api/v1/profile",
    "http://127.0.0.1:8000/api/v1/profile",
  ];

  let lastErr: any = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_markdown }),
      });
      if (res.ok) {
        return await res.json();
      }
      lastErr = new Error(`Endpoint ${url} returned status ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("Unable to save profile");
}

export async function searchMemories(query: string, top_k = 5): Promise<MemoryItem[]> {
  const res = await fetch(`${getApiBase()}/memory/search?q=${encodeURIComponent(query)}&top_k=${top_k}`);
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.results || [];
}

export async function ingestVoiceTranscript(transcript: string): Promise<any> {
  const res = await fetch(`${getApiBase()}/voice/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, source: "browser_voice" }),
  });
  if (!res.ok) {
    throw new Error("Failed to ingest voice");
  }
  return res.json();
}

export async function fetchHealth(): Promise<{ status: string; memories_synced: number }> {
  try {
    const res = await fetch(`${getApiBase()}/health`, { cache: "no-store" });
    if (!res.ok) throw new Error();
    return res.json();
  } catch {
    return { status: "offline", memories_synced: 0 };
  }
}

