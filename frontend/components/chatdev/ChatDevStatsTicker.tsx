"use client";
import React from "react";
import { Play, RotateCcw, FastForward, Sliders } from "lucide-react";

interface ChatDevStatsTickerProps {
  phase: string;
  utterancesCount: number;
  citedCount: number;
  syncedCount: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onReplay?: () => void;
  isReplaying?: boolean;
}

export function ChatDevStatsTicker({
  phase,
  utterancesCount,
  citedCount,
  syncedCount,
  speed,
  onSpeedChange,
  onReplay,
  isReplaying = false,
}: ChatDevStatsTickerProps) {
  return (
    <div className="w-full bg-[#1e222d] border-y border-[#343a46] px-4 py-2.5 font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: ChatDev Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 overflow-x-auto text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131720] border border-[#2d3442] text-amber-300">
            <span>⚖️ phase:</span>
            <span className="text-white font-bold">{phase}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131720] border border-[#2d3442] text-cyan-300">
            <span>🗣️ utterances:</span>
            <span className="text-white font-bold">{utterancesCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131720] border border-[#2d3442] text-emerald-300">
            <span>📚 memories_cited:</span>
            <span className="text-white font-bold">{citedCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131720] border border-[#2d3442] text-violet-300">
            <span>🧠 qdrant_memories:</span>
            <span className="text-white font-bold">{syncedCount}</span>
          </div>
        </div>

        {/* Right: Replay & Speed Controls */}
        <div className="flex items-center gap-3">
          {onReplay && (
            <button
              onClick={onReplay}
              disabled={isReplaying}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2a303c] border border-[#454f63] text-slate-200 hover:text-white hover:bg-[#343b4a] transition-all disabled:opacity-50 text-[11px]"
              title="Replay Agent Deliberation"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Replay</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-[#131720] border border-[#2d3442] px-3 py-1 rounded text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <FastForward className="w-3 h-3 text-amber-400" />
              Speed:
            </span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer h-1.5 bg-[#343a46] rounded-lg"
            />
            <span className="text-amber-400 font-bold min-w-[24px]">{speed}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
