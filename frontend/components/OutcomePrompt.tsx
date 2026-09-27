"use client";
import React, { useState } from "react";
import { CheckCircle2, History, Send } from "lucide-react";
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
      <div className="w-full max-w-xl mx-auto my-6 px-4">
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 backdrop-blur-xl p-5 text-center space-y-2 animate-in fade-in duration-300">
          <div className="flex justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-emerald-300">
            Feedback Loop Closed
          </h3>
          <p className="text-xs text-slate-300 font-sans">
            Your decision was permanently appended to <code className="text-amber-400 font-mono">user.md</code> and re-embedded into your Qdrant vector memory.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto my-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-3 text-amber-400 font-mono text-xs uppercase tracking-widest">
          <History className="w-4 h-4" />
          <span>Close The Loop: Log Your Actual Choice</span>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          The court has advised, but you make the final call. Recording your choice teaches Courtroom Mode what matters to you over time.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              What did you actually decide?
            </label>
            <input
              type="text"
              required
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="e.g. Accepted with renegotiated weekend rotation, or Declined offer"
              className="w-full bg-slate-950/90 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Personal reflection / context (optional)
            </label>
            <input
              type="text"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="e.g. Prioritizing my mental health felt immediately right"
              className="w-full bg-slate-950/90 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting || !decision.trim()}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <span>{submitting ? "Embedding..." : "Commit To Memory"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
