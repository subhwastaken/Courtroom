"use client";
import React, { useState, useEffect, useRef } from "react";
import { CourtroomChamber } from "@/components/courtroom/CourtroomChamber";
import { CourtroomPlan2D } from "@/components/courtroom/CourtroomPlan2D";
import { DialogueStream } from "@/components/courtroom/DialogueStream";
import { CourtroomStatsTicker } from "@/components/courtroom/CourtroomStatsTicker";
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

    let cumulativeDelay = 600 / currentSpeed;

    res.turns.forEach((turn, i) => {
      const t = setTimeout(() => {
        setActiveTurn(i + 1);
        playAgentSpeakSound(turn.role);
        if (i === res.turns.length - 1) {
          setIsReplaying(false);
        }
      }, cumulativeDelay);
      timeoutsRef.current.push(t);

      // Conversational reading duration so each bubble stays visible
      // before the next agent interjects
      const readingDuration =
        Math.max(2800, Math.min(4800, turn.content.length * 26)) / currentSpeed;
      cumulativeDelay += readingDuration;
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
    : !result || activeTurn === 0
    ? "Chamber Standby"
    : activeTurn >= result.turns.length
    ? "Judicial Ruling Delivered"
    : (() => {
        const curTurn = result.turns[activeTurn - 1];
        if (!curTurn) return "Chamber Standby";
        const roleLabel =
          curTurn.role === "advocate"
            ? "Advocate Point"
            : curTurn.role === "skeptic"
            ? "Skeptic Objection"
            : "Chief Justice Direction";
        return roleLabel;
      })();

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between overflow-x-hidden pb-16 bg-[#120907]">
      {/* Live Judicial Session Stats & Ticker Bar */}
      <CourtroomStatsTicker
        phase={currentPhase}
        utterancesCount={activeTurn}
        totalTurns={result?.turns.length}
        citedCount={totalCitations}
        syncedCount={syncedCount}
        speed={speed}
        onSpeedChange={handleSpeedChange}
        onReplay={result ? handleReplay : undefined}
        isReplaying={isReplaying}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Collaboration Chamber Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 flex flex-col gap-6">
        {/* Loading Overlay */}
        {loading && (
          <div className="flex items-center justify-center p-6 bg-[#1C100B] border-3 border-black shadow-[6px_6px_0px_#FFE600] text-neo-yellow font-mono text-xs gap-3 select-none">
            <Scale className="w-5 h-5 animate-spin text-neo-yellow" />
            <span className="font-bold uppercase tracking-wider">
              Retrieving historical vector memories & initiating multi-agent debate...
            </span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-[#260E0E] border-3 border-black shadow-[6px_6px_0px_#E52521] text-neo-red font-mono text-xs text-center font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        {/* 2-Column Split: Visual Stage (Left) & Dialogue Stream (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): 16-bit Front Chamber or 2D Nintendo RPG Plan */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 font-mono text-xs">
              <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-neo-yellow" />
                Chamber of Conscience
                <span className="text-[9px] px-1.5 py-0.5 bg-neo-yellow text-black border border-black font-black uppercase ml-1 shadow-[1px_1px_0px_#000]">
                  {viewMode === "3d" ? "16-Bit View" : "2D RPG Map"}
                </span>
              </span>
              <span className="text-[#FFE885] text-[11px] font-mono font-bold">
                Active Tribunal
              </span>
            </div>
            <div className="relative">
              {viewMode === "3d" ? (
                <CourtroomChamber
                  activeTurnIndex={activeTurn}
                  turns={result?.turns || []}
                />
              ) : (
                <CourtroomPlan2D
                  activeTurnIndex={activeTurn}
                  turns={result?.turns || []}
                />
              )}
            </div>

            {/* Verdict Gavel Banner when Ruling Lands */}
            {result && activeTurn >= result.turns.length && (
              <VerdictGavel
                verdict={result.verdict}
                citations={result.verdict_citations}
                decree={result.actionable_decree}
              />
            )}
          </div>

          {/* Right Column (5 cols): Judicial Dialogue Stream */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 font-mono text-xs">
              <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neo-yellow" />
                Judicial Deliberation Stream
              </span>
              <span className="text-[#FFE885] text-[11px] font-mono font-bold">
                {result ? (activeTurn >= result.turns.length ? "Ruling Finalized" : "Adversarial Hearing") : "Tribunal Ready"}
              </span>
            </div>

            <div className="max-h-[560px] overflow-y-auto pr-1">
              <DialogueStream
                turns={result?.turns || []}
                activeTurnIndex={activeTurn}
                question={result?.question}
              />
              {!result && !loading && (
                <div className="bg-[#1C100B] border-3 border-black p-8 text-center text-[#FFF8E7] font-mono text-xs space-y-3 shadow-[5px_5px_0px_#000]">
                  <div className="w-14 h-14 mx-auto border-3 border-black overflow-hidden bg-black shadow-[3px_3px_0px_#000]">
                    <img
                      src="/pixel_court_badge.jpg"
                      alt="Awaiting Docket"
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <p className="font-pixel text-[10px] text-neo-yellow uppercase font-black tracking-wider">
                    Awaiting Case Submission
                  </p>
                  <p className="text-[11px] text-[#FFF8E7] leading-relaxed font-mono">
                    Type a life dilemma or speak via microphone below to watch the Advocate, Skeptic, and Chief Justice deliberate in real-time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Dock: Text Query + Preset Pills + Voice Capture */}
        <div className="mt-4 pt-6 border-t-3 border-black flex flex-col items-center gap-4">
          <DecisionInput onSubmit={handleAsk} disabled={loading} />
          <VoiceCapture onTranscript={handleAsk} disabled={loading} />
        </div>

        {/* Closed-Loop Decision Outcome Prompt */}
        {result && activeTurn >= result.turns.length && (
          <OutcomePrompt
            question={result.question}
            onLog={handleLoggedOutcome}
          />
        )}
      </div>
    </div>
  );
}
