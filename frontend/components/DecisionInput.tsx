"use client";
import React, { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { playClickSound } from "@/lib/sounds";

interface DecisionInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

const PRESET_CASES = [
  "Should I take a new job that pays more but requires being on-call every weekend?",
  "Should I move closer to my family within the next year or stay in the city?",
  "Should I leave my stable corporate role to join an early-stage startup?",
  "Should I negotiate for higher equity instead of base salary?",
];

export function DecisionInput({ onSubmit, disabled = false }: DecisionInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || disabled) return;
    playClickSound();
    onSubmit(question.trim());
  };

  const handleSelectPreset = (preset: string) => {
    setQuestion(preset);
    playClickSound();
    onSubmit(preset);
  };

  return (
    <div className="w-full max-w-2xl px-4 flex flex-col items-center gap-3">
      {/* Main Decision Form */}
      <form onSubmit={handleSubmit} className="w-full relative flex items-center">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="State your dilemma for the court (e.g. Should I accept this new offer?)..."
          disabled={disabled}
          className="w-full bg-slate-950/90 border border-amber-500/40 rounded-xl px-4 py-3.5 pr-28 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-2xl backdrop-blur font-sans transition-all"
        />
        <button
          type="submit"
          disabled={disabled || !question.trim()}
          className="absolute right-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
        >
          <span>Convene</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Suggested Case Questions */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Preset Cases:</span>
        </span>
        {PRESET_CASES.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            disabled={disabled}
            className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 hover:bg-slate-850 transition-all max-w-[260px] truncate"
            title={preset}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
