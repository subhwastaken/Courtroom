"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChatDev3DCourtroom } from "@/components/chatdev/ChatDev3DCourtroom";
import { ChatDevOffice2D } from "@/components/chatdev/ChatDevOffice2D";
import { ChatDevDialogueStream } from "@/components/chatdev/ChatDevDialogueStream";
import { ChatDevStatsTicker } from "@/components/chatdev/ChatDevStatsTicker";
import { VerdictGavel } from "@/components/scene/VerdictGavel";
import { DecisionInput } from "@/components/DecisionInput";
import { VoiceCapture } from "@/components/VoiceCapture";
import { OutcomePrompt } from "@/components/OutcomePrompt";
import { runDecision, logOutcome, fetchHealth } from "@/lib/api";
import { playAgentSpeakSound } from "@/lib/sounds";
import type { DecisionResponse } from "@/lib/types";
import { Box, Layers, Scale, Sparkles } from "lucide-react";

export default function CourtroomPage() {
  const [result, setResult] = useState<DecisionResponse | null>(null);
  const [activeTurn, setActiveTurn] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState<number>(8);
  const [speed, setSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"3d" | "2d">("3d");
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    fetchHealth()
      .then((h) => {
        if (h.memories_synced) setSyncedCount(h.memories_synced);
      })
      .catch(() => {});
  }, []);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const playSequence = (res: DecisionResponse, currentSpeed: number) => {
    clearTimeouts();
    setActiveTurn(0);
    setIsReplaying(true);

    const baseDelay = 2200 / currentSpeed;

    res.turns.forEach((turn, i) => {
      const t = setTimeout(() => {
        setActiveTurn(i + 1);
        playAgentSpeakSound(turn.role);
        if (i === res.turns.length - 1) {
          setIsReplaying(false);
        }
      }, (i + 1) * baseDelay);
      timeoutsRef.current.push(t);
    });
  };

  async function handleAsk(question: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    clearTimeouts();
    setActiveTurn(0);

    try {
      const res = await runDecision(question);
      setResult(res);
      setLoading(false);
      playSequence(res, speed);
    } catch (err: any) {
      console.error("Decision failed:", err);
      setError(err.message || "Failed to convene court");
      setLoading(false);
    }
  }

  const handleReplay = () => {
    if (!result) return;
    playSequence(result, speed);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (result && isReplaying) {
      playSequence(result, newSpeed);
    }
  };

  const handleLoggedOutcome = async (
    question: string,
    actual_decision: string,
    reflection?: string
  ) => {
    const res = await logOutcome(question, actual_decision, reflection);
    if (res.memory_count) {
      setSyncedCount(res.memory_count);
    }
    return res;
  };

  // Compute counts
  const totalCitations =
    result?.turns.reduce((acc, t) => acc + (t.cited_memories?.length || 0), 0) || 0;

  const currentPhase = loading
    ? "Deliberating..."
    : activeTurn === 1
    ? "Advocate Opening Argument"
    : activeTurn === 2
    ? "Skeptic Direct Rebuttal"
    : activeTurn >= 3
    ? "Judicial Ruling Delivered"
    : "Chamber Standby";

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between overflow-x-hidden pb-16 bg-[#0c0806]">
      {/* Top Courtroom Header Banner */}
      <div className="w-full bg-[#160e09] border-b border-[#3d2112] px-4 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#26150b] border-2 border-[#d4af37]/60 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Scale className="w-6 h-6 text-[#d4af37]" />
            </div>
            <div>
              <div className="font-mono text-sm font-bold uppercase tracking-widest text-[#d4af37] flex items-center gap-2">
                <span>Chamber of Personal Conscience</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#3d2112] text-amber-200 border border-[#d4af37]/30">
                  COURT IN SESSION
                </span>
              </div>
              <div className="text-[11px] font-mono text-amber-200/60">
                Adversarial Deliberation Engine • Grounded in Living Personal History
              </div>
            </div>
          </div>

          {/* View Mode Switcher: 3D Courtroom vs 2D Floor Plan */}
          <div className="flex items-center gap-2 bg-[#100905] border border-[#3d2112] p-1 rounded-xl font-mono text-xs">
            <button
              onClick={() => setViewMode("3d")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "3d"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                  : "text-amber-200/60 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Courtroom Chamber</span>
            </button>

            <button
              onClick={() => setViewMode("2d")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "2d"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md"
                  : "text-amber-200/60 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Chamber Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* ChatDev Live Stats & Ticker Bar */}
      <ChatDevStatsTicker
        phase={currentPhase}
        utterancesCount={activeTurn}
        citedCount={totalCitations}
        syncedCount={syncedCount}
        speed={speed}
        onSpeedChange={handleSpeedChange}
        onReplay={result ? handleReplay : undefined}
        isReplaying={isReplaying}
      />

      {/* Main Collaboration Chamber Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Loading Overlay */}
        {loading && (
          <div className="flex items-center justify-center p-6 rounded-xl bg-[#141824] border border-amber-500/40 text-amber-400 font-mono text-xs gap-3 animate-pulse shadow-xl">
            <Scale className="w-5 h-5 animate-spin" />
            <span>Retrieving historical vector memories & initiating Lyzr multi-agent debate...</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono text-xs text-center">
            {error}
          </div>
        )}

        {/* 2-Column Split: Visual Stage (Left) & Dialogue Stream (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): 3D Three.js Diorama or 2D ChatDev Office */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative">
              {viewMode === "3d" ? (
                <ChatDev3DCourtroom
                  activeTurnIndex={activeTurn}
                  turns={result?.turns || []}
                />
              ) : (
                <ChatDevOffice2D
                  activeTurnIndex={activeTurn}
                  turns={result?.turns || []}
                />
              )}
            </div>

            {/* Verdict Gavel Banner when Ruling Lands */}
            {result && activeTurn >= 3 && (
              <VerdictGavel
                verdict={result.verdict}
                citations={result.verdict_citations}
              />
            )}
          </div>

          {/* Right Column (5 cols): ChatDev Dialogue Box */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#2d3442] pb-2 font-mono text-xs">
              <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Agent Collaboration Log
              </span>
              <span className="text-slate-500 text-[11px]">
                {activeTurn} / {result?.turns.length || 3} Turns
              </span>
            </div>

            <div className="max-h-[560px] overflow-y-auto pr-1">
              <ChatDevDialogueStream
                turns={result?.turns || []}
                activeTurnIndex={activeTurn}
                question={result?.question}
              />
              {!result && !loading && (
                <div className="rounded-xl border border-dashed border-[#2d3442] p-8 text-center text-slate-500 font-mono text-xs space-y-2">
                  <p>Awaiting case submission.</p>
                  <p className="text-[11px] text-slate-600">
                    Type a life dilemma or speak via microphone below to watch the Advocate, Skeptic, and Chief Justice deliberate in real-time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Dock: Text Query + Preset Pills + Voice Capture */}
        <div className="mt-4 pt-6 border-t border-[#2d3442] flex flex-col items-center gap-4">
          <DecisionInput onSubmit={handleAsk} disabled={loading} />
          <VoiceCapture onTranscript={handleAsk} disabled={loading} />
        </div>

        {/* Closed-Loop Decision Outcome Prompt */}
        {result && activeTurn >= 3 && (
          <OutcomePrompt
            question={result.question}
            onLog={handleLoggedOutcome}
          />
        )}
      </div>
    </div>
  );
}
