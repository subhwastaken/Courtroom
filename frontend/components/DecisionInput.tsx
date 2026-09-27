"use client";
import React, { useState } from "react";
import { ArrowRight, Sparkles, Scale } from "lucide-react";
import { playClickSound } from "@/lib/sounds";

interface DecisionInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

const PRESET_CASES = [
  "Should I leave my corporate tech job to build an AI startup?",
  "Should I negotiate for higher equity instead of base salary?",
  "Should I move to another city for career opportunities or stay near family?",
  "Should I buy real estate now or keep my net worth liquid in index funds?",
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
    <div className="w-full max-w-3xl px-4 flex flex-col items-center gap-3.5 select-none">
      {/* Main Decision Form */}
      <form onSubmit={handleSubmit} className="w-full relative flex items-center">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="State your dilemma for the court (e.g. Should I accept this new offer?)..."
          disabled={disabled}
          className="w-full bg-[#101726] border-3 border-black shadow-[5px_5px_0px_#000] px-4 py-3.5 pr-32 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-neo-yellow focus:shadow-[6px_6px_0px_#FFE600] font-mono transition-all"
        />
        <button
          type="submit"
          disabled={disabled || !question.trim()}
          className="neo-btn absolute right-2 px-4 py-2 bg-neo-yellow text-black font-mono text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
        >
          <Scale className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Convene</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </form>

      {/* Suggested Preset Case Questions */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono text-[10px]">
        <span className="uppercase tracking-widest text-neo-yellow font-bold flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-neo-yellow" />
          <span>Preset Dockets:</span>
        </span>
        {PRESET_CASES.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            disabled={disabled}
            className="px-2.5 py-1 bg-[#162032] border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-neo-yellow hover:text-black text-slate-200 transition-all text-[10px] active:translate-x-[1px] active:translate-y-[1px]"
          >
            {preset.slice(0, 42)}...
          </button>
        ))}
      </div>
    </div>
  );
}
