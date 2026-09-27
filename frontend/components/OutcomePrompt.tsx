"use client";
import React, { useState } from "react";
import { CheckCircle2, History, Send, ArrowRight } from "lucide-react";
import { playClickSound } from "@/lib/sounds";

interface OutcomePromptProps {
  question: string;
  onLog: (question: string, actual_decision: string, reflection?: string) => Promise<any>;
}

export function OutcomePrompt({ question, onLog }: OutcomePromptProps) {
  const [decision, setDecision] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim() || submitting) return;
    setSubmitting(true);
    playClickSound();

    try {
      await onLog(question, decision.trim(), reflection.trim() || undefined);
      setSubmitted(true);
    } catch (err) {
      console.error("Error logging outcome:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto my-6 px-4 select-none">
        <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-neo-green text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="font-pixel text-xs sm:text-sm font-black uppercase tracking-wider text-neo-green">
            FEEDBACK LOOP CLOSED
          </h3>
          <p className="text-xs text-[#FFF8E7] font-mono leading-relaxed">
            Your decision was permanently recorded in <code className="text-neo-yellow font-bold">user.md</code> and re-embedded into your Qdrant vector memory bank for future precedent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto my-8 px-4 select-none animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#1C100B] border-4 border-black shadow-[8px_8px_0px_#000] p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-neo-yellow text-black px-2.5 py-0.5 border-2 border-black font-pixel text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] -rotate-1">
            RECORD OUTCOME
          </span>
          <span className="font-mono text-[11px] text-[#FFE885] uppercase tracking-wider font-bold">
            Close the Judicial Loop
          </span>
        </div>

        <p className="text-xs text-[#FFF8E7] mb-4 leading-relaxed font-mono">
          The court has advised, but you make the final call. Recording your choice teaches the tribunal what matters to you over time.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neo-yellow font-bold mb-1">
              What did you actually decide?
            </label>
            <input
              type="text"
              required
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="e.g. Accepted with renegotiated weekend rotation, or Declined offer"
              className="w-full bg-[#26150F] border-3 border-black shadow-[3px_3px_0px_#000] px-3.5 py-2.5 text-xs text-[#FFF8E7] placeholder-[#FFE885]/60 focus:outline-none focus:border-neo-yellow font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#FFE885] font-bold mb-1">
              Personal reflection / context (optional)
            </label>
            <textarea
              rows={2}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="e.g. Realized health and sleep were non-negotiable..."
              className="w-full bg-[#26150F] border-3 border-black shadow-[3px_3px_0px_#000] px-3.5 py-2.5 text-xs text-[#FFF8E7] placeholder-[#FFE885]/60 focus:outline-none focus:border-neo-yellow font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !decision.trim()}
            className="neo-btn w-full py-3 bg-neo-green text-black font-mono text-xs font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000] hover:bg-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{submitting ? "Writing to Memory..." : "Append to Living Memory"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
