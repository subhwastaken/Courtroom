"use client";
import React from "react";
import { RotateCcw, FastForward, Scale, BookOpen, Database, MessageSquare } from "lucide-react";

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
    <div className="w-full bg-[#150e09] border-y border-[#3d2112] px-4 py-2.5 font-mono text-xs select-none shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Courtroom Dossier Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto text-[11px]">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#21140c] border border-[#522a15] text-amber-300 shadow-sm">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-200/60 uppercase tracking-wider text-[10px]">Session:</span>
            <span className="text-amber-100 font-bold">{phase}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#21140c] border border-[#522a15] text-cyan-300 shadow-sm">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-200/60 uppercase tracking-wider text-[10px]">Arguments:</span>
            <span className="text-white font-bold">{utterancesCount} / 3</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#21140c] border border-[#522a15] text-emerald-300 shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-200/60 uppercase tracking-wider text-[10px]">Precedents Cited:</span>
            <span className="text-white font-bold">{citedCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#21140c] border border-[#522a15] text-amber-400 shadow-sm">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-200/60 uppercase tracking-wider text-[10px]">Vector Memories:</span>
            <span className="text-white font-bold">{syncedCount} Synced</span>
          </div>
        </div>

        {/* Right: Replay & Speed Controls */}
        <div className="flex items-center gap-3">
          {onReplay && (
            <button
              onClick={onReplay}
              disabled={isReplaying}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2b180d] border border-[#5c3017] text-amber-200 hover:text-white hover:bg-[#3d2112] transition-all disabled:opacity-40 text-[11px] shadow-sm"
              title="Replay Courtroom Proceedings"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Replay Trial</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-[#21140c] border border-[#522a15] px-3 py-1 rounded-lg text-[11px] shadow-sm">
            <span className="text-amber-200/70 flex items-center gap-1">
              <FastForward className="w-3 h-3 text-amber-400" />
              Pace:
            </span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 cursor-pointer h-1.5 bg-[#3d2112] rounded-lg"
            />
            <span className="text-amber-400 font-bold min-w-[24px]">{speed}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
