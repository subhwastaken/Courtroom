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
      <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-2.5 items-stretch">
        <div className="flex-1 relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="State your dilemma (e.g. Should I accept this new offer?)..."
            disabled={disabled}
            className="w-full bg-[#1C100B] border-3 border-black shadow-[4px_4px_0px_#000] px-4 py-3 text-xs sm:text-sm text-[#FFF8E7] placeholder-[#FFE885]/60 focus:outline-none focus:border-neo-yellow focus:shadow-[5px_5px_0px_#FFE600] font-mono transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !question.trim()}
          className="neo-btn px-5 py-3 bg-neo-yellow text-black font-mono text-xs sm:text-sm font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-amber-300 active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Scale className="w-4 h-4 stroke-[2.5]" />
          <span>CONVENE</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
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
            className="px-2.5 py-1 bg-[#26150F] border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-neo-yellow hover:text-black text-[#FFF8E7] transition-all text-[10px] active:translate-x-[1px] active:translate-y-[1px]"
          >
            {preset.slice(0, 42)}...
          </button>
        ))}
      </div>
    </div>
  );
}
