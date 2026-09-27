"use client";
import React from "react";
import { RotateCcw, FastForward, Scale, BookOpen, Database, MessageSquare } from "lucide-react";

interface CourtroomStatsTickerProps {
  phase: string;
  utterancesCount: number;
  citedCount: number;
  syncedCount: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onReplay?: () => void;
  isReplaying?: boolean;
}

export function CourtroomStatsTicker({
  phase,
  utterancesCount,
  citedCount,
  syncedCount,
  speed,
  onSpeedChange,
  onReplay,
  isReplaying = false,
}: CourtroomStatsTickerProps) {
  return (
    <div className="w-full bg-[#0e1320] border-b-4 border-black px-4 py-2.5 font-mono text-xs select-none shadow-[0_4px_0px_#000] z-10">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Courtroom Dossier Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 overflow-x-auto text-[11px]">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#162032] border-2 border-black text-neo-yellow shadow-[2px_2px_0px_#000]">
            <Scale className="w-3.5 h-3.5 text-neo-yellow" />
            <span className="text-amber-200/60 uppercase tracking-wider text-[10px]">Session:</span>
            <span className="text-white font-black">{phase}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#162032] border-2 border-black text-cyan-300 shadow-[2px_2px_0px_#000]">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-200/60 uppercase tracking-wider text-[10px]">Arguments:</span>
            <span className="text-white font-black">{utterancesCount} / 3</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#162032] border-2 border-black text-neo-green shadow-[2px_2px_0px_#000]">
            <BookOpen className="w-3.5 h-3.5 text-neo-green" />
            <span className="text-emerald-200/60 uppercase tracking-wider text-[10px]">Precedents:</span>
            <span className="text-white font-black">{citedCount} Cited</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#162032] border-2 border-black text-amber-300 shadow-[2px_2px_0px_#000]">
            <Database className="w-3.5 h-3.5 text-neo-yellow" />
            <span className="text-amber-200/60 uppercase tracking-wider text-[10px]">Memories:</span>
            <span className="text-white font-black">{syncedCount} Synced</span>
          </div>
        </div>

        {/* Right: Replay & Speed Controls */}
        <div className="flex items-center gap-3">
          {onReplay && (
            <button
              onClick={onReplay}
              disabled={isReplaying}
              className="neo-btn flex items-center gap-1.5 px-3 py-1 bg-neo-yellow text-black border-2 border-black font-black uppercase text-[11px] shadow-[2px_2px_0px_#000] disabled:opacity-40"
              title="Replay Courtroom Proceedings"
            >
              <RotateCcw className="w-3 h-3 text-black stroke-[2.5]" />
              <span>Replay Trial</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-[#162032] border-2 border-black px-3 py-1 text-[11px] shadow-[2px_2px_0px_#000]">
            <span className="text-amber-200/70 flex items-center gap-1">
              <FastForward className="w-3 h-3 text-neo-yellow" />
              Pace:
            </span>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-16 accent-neo-yellow cursor-pointer h-1.5 bg-black rounded-none"
            />
            <span className="text-neo-yellow font-black min-w-[24px]">{speed}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
