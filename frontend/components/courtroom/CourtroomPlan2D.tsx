"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AgentTurn, AgentRole } from "@/lib/types";
import {
  Scale,
  ShieldAlert,
  Gavel,
  Volume2,
  VolumeX,
  Camera,
  RotateCcw,
  Sparkles,
  MapPin,
  Eye
} from "lucide-react";

interface CourtroomPlan2DProps {
  activeTurnIndex: number;
  turns: AgentTurn[];
}

type PlanCameraPreset = "full" | "bench" | "advocate" | "skeptic" | "witness";

export function CourtroomPlan2D({ activeTurnIndex, turns }: CourtroomPlan2DProps) {
  const [cameraView, setCameraView] = useState<PlanCameraPreset>("full");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoCam, setAutoCam] = useState<boolean>(true);
  const [displayedDialogue, setDisplayedDialogue] = useState<string>("");
  const typewriterIndexRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Active turn
  const activeTurn = activeTurnIndex > 0 && turns[activeTurnIndex - 1]
    ? turns[activeTurnIndex - 1]
    : null;
  const activeRole: AgentRole | null = activeTurn ? activeTurn.role : null;

  // ──────────────────────────────────────────────────────────
  //  SYNTHESIZED RETRO AUDIO (POKÉMON / NINTENDO GBA STYLE)
  // ──────────────────────────────────────────────────────────
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playRetroSound = useCallback((type: "gavel" | "text" | "chime") => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === "gavel") {
        // Wooden gavel strike
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "text") {
        // Classic Nintendo RPG text chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === "chime") {
        // RPG item/encounter fanfare
        const notes = [440, 554.37, 659.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.08, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.22);
        });
      }
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled, getAudioContext]);

  // ──────────────────────────────────────────────────────────
  //  TURN HANDLING & TYPEWRITER
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeTurn) {
      setDisplayedDialogue("");
      return;
    }

    if (autoCam) {
      if (activeTurn.role === "advocate") setCameraView("advocate");
      else if (activeTurn.role === "skeptic") setCameraView("skeptic");
      else if (activeTurn.role === "judge") setCameraView("bench");
    }

    if (activeTurn.role === "judge") {
      playRetroSound("gavel");
    } else {
      playRetroSound("chime");
    }

    setDisplayedDialogue("");
    typewriterIndexRef.current = 0;
    const fullText = activeTurn.content;
    const interval = setInterval(() => {
      typewriterIndexRef.current += 3;
      if (typewriterIndexRef.current >= fullText.length) {
        setDisplayedDialogue(fullText);
        clearInterval(interval);
      } else {
        setDisplayedDialogue(fullText.slice(0, typewriterIndexRef.current));
      }
    }, 28);

    return () => clearInterval(interval);
  }, [activeTurnIndex, turns, autoCam, playRetroSound]);

  // ──────────────────────────────────────────────────────────
  //  CAMERA TRANSFORMS
  // ──────────────────────────────────────────────────────────
  const getCameraTransform = () => {
    switch (cameraView) {
      case "bench":
        return "scale(1.48) translate(0%, 15%)";
      case "advocate":
        return "scale(1.45) translate(18%, -2%)";
      case "skeptic":
        return "scale(1.45) translate(-18%, -2%)";
      case "witness":
        return "scale(1.5) translate(0%, -3%)";
      case "full":
      default:
        return "scale(1) translate(0%, 0%)";
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full select-none">
      <style jsx global>{`
        @keyframes rgpBounceArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        @keyframes targetPing {
          0% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
        @keyframes rpgIconBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────
       *  MAIN 2D POKÉMON / NINTENDO RPG COURTROOM FRAME
       * ────────────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0c0805] border-2 border-[#5c3823] shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
        {/* VIEWPORT WITH SMOOTH RPG CAMERA PAN & ZOOM */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ transform: getCameraTransform() }}
        >
          {/* Authentic Top-Down 16-Bit Pixel RPG Courtroom Map */}
          <img
            src="/courtroom_2d_rpg_plan.jpg"
            alt="Courtroom 2D Pixel RPG Chamber Map"
            className="w-full h-full object-cover pointer-events-none"
            style={{ imageRendering: "pixelated" }}
          />

          {/* ──────────────────────────────────────────────────────────
           *  1. HIGH BENCH (CHIEF JUSTICE)
           * ────────────────────────────────────────────────────────── */}
          <div
            onClick={() => {
              setCameraView("bench");
              playRetroSound("gavel");
            }}
            className="absolute cursor-pointer group"
            style={{
              left: "40%",
              top: "10%",
              width: "20%",
              height: "26%",
            }}
            title="Supreme Bench • Chief Justice"
          >
            {/* Active Turn Reticle / Spotlight */}
            {activeRole === "judge" && (
              <div className="absolute inset-0 border-2 border-amber-400 bg-amber-400/20 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.7)] animate-pulse" />
            )}

            {/* RPG Exclamation Balloon */}
            {activeRole === "judge" && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono text-[9px] font-black uppercase tracking-wider shadow-lg animate-[rpgIconBob_1.2s_infinite_ease-in-out] flex items-center gap-1">
                <Gavel className="w-2.5 h-2.5" />
                <span>RULING</span>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────
           *  2. ADVOCATE TABLE (LEFT COUNSEL)
           * ────────────────────────────────────────────────────────── */}
          <div
            onClick={() => {
              setCameraView("advocate");
              playRetroSound("chime");
            }}
            className="absolute cursor-pointer group"
            style={{
              left: "22%",
              top: "40%",
              width: "16%",
              height: "24%",
            }}
            title="Defense Counsel • The Advocate"
          >
            {/* Active Turn Reticle / Spotlight */}
            {activeRole === "advocate" && (
              <div className="absolute inset-0 border-2 border-emerald-400 bg-emerald-500/25 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.7)] animate-pulse" />
            )}

            {/* RPG Exclamation Balloon */}
            {activeRole === "advocate" && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-mono text-[9px] font-black uppercase tracking-wider shadow-lg animate-[rpgIconBob_1.2s_infinite_ease-in-out] flex items-center gap-1">
                <Scale className="w-2.5 h-2.5" />
                <span>ARGUES</span>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────
           *  3. SKEPTIC TABLE (RIGHT COUNSEL)
           * ────────────────────────────────────────────────────────── */}
          <div
            onClick={() => {
              setCameraView("skeptic");
              playRetroSound("chime");
            }}
            className="absolute cursor-pointer group"
            style={{
              left: "62%",
              top: "40%",
              width: "16%",
              height: "24%",
            }}
            title="Prosecution / Skeptic Counsel"
          >
            {/* Active Turn Reticle / Spotlight */}
            {activeRole === "skeptic" && (
              <div className="absolute inset-0 border-2 border-rose-400 bg-rose-500/25 rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse" />
            )}

            {/* RPG Exclamation Balloon */}
            {activeRole === "skeptic" && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-rose-400 text-slate-950 font-mono text-[9px] font-black uppercase tracking-wider shadow-lg animate-[rpgIconBob_1.2s_infinite_ease-in-out] flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5" />
                <span>OBJECTS</span>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────
           *  4. WITNESS BOX (CENTER DAIS)
           * ────────────────────────────────────────────────────────── */}
          <div
            onClick={() => setCameraView("witness")}
            className="absolute cursor-pointer group"
            style={{
              left: "45%",
              top: "42%",
              width: "10%",
              height: "18%",
            }}
            title="Witness Stand • Living Memory Record"
          >
            <div className="absolute inset-0 border border-amber-500/0 group-hover:border-amber-400/60 rounded transition-all" />
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
         *  AUTHENTIC POKÉMON / NINTENDO RPG DIALOGUE BOX (BOTTOM)
         * ────────────────────────────────────────────────────────── */}
        <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none">
          <div className="relative bg-[#0d1627]/95 border-4 border-[#e8d28a] rounded-xl p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.95)] backdrop-blur flex items-start gap-3.5">
            {/* Speaker Pixel Portrait Thumbnail */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 border-[#e8d28a] bg-[#1a253b] flex-shrink-0 p-0.5 shadow-inner">
              <img
                src={
                  activeRole === "advocate"
                    ? "/sprite_cutout_advocate.png"
                    : activeRole === "skeptic"
                    ? "/sprite_cutout_skeptic.png"
                    : activeRole === "judge"
                    ? "/sprite_cutout_judge.png"
                    : "/sprite_cutout_judge.png"
                }
                alt="Speaker"
                className="w-full h-full object-contain pointer-events-none"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            {/* Dialogue Text Content */}
            <div className="flex-1 min-w-0 pr-6">
              {/* Speaker Name Tag */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded shadow ${
                    activeRole === "advocate"
                      ? "bg-emerald-600 text-white"
                      : activeRole === "skeptic"
                      ? "bg-rose-600 text-white"
                      : activeRole === "judge"
                      ? "bg-amber-500 text-slate-950"
                      : "bg-[#253655] text-amber-200"
                  }`}
                >
                  {activeRole === "advocate"
                    ? "ADVOCATE"
                    : activeRole === "skeptic"
                    ? "SKEPTIC"
                    : activeRole === "judge"
                    ? "CHIEF JUSTICE"
                    : "COURTROOM CLERK"}
                </span>
                <span className="font-mono text-[10px] text-amber-200/50 uppercase tracking-wider hidden sm:inline">
                  {activeRole === "advocate"
                    ? "Counsel for Opportunity"
                    : activeRole === "skeptic"
                    ? "Counsel for Caution"
                    : activeRole === "judge"
                    ? "Supreme Deliberation"
                    : "Chamber Plan Ready"}
                </span>
              </div>

              {/* Dialogue Text */}
              <p className="font-sans text-xs sm:text-sm text-slate-100 leading-relaxed line-clamp-3">
                {displayedDialogue
                  ? `“${displayedDialogue}”`
                  : "The judicial chamber is assembled. Enter a case dilemma to initiate multi-agent adversarial debate."}
              </p>
            </div>

            {/* Blinking Nintendo RPG Prompt Arrow (▼) */}
            <div className="absolute bottom-2.5 right-3 text-amber-400 font-mono text-xs sm:text-sm animate-[rgpBounceArrow_0.8s_infinite_ease-in-out]">
              ▼
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
         *  TOP HUD CONTROLS
         * ────────────────────────────────────────────────────────── */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1 bg-[#0d1627]/90 border-2 border-[#e8d28a]/60 p-1 rounded-xl font-mono text-[10px] text-amber-200 backdrop-blur pointer-events-auto shadow-lg">
            <span className="text-amber-400 font-bold px-1.5 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              View:
            </span>
            <button
              onClick={() => {
                setCameraView("full");
                setAutoCam(false);
              }}
              className={`px-2 py-0.5 rounded transition-all ${
                cameraView === "full"
                  ? "bg-amber-500 text-slate-950 font-bold shadow"
                  : "text-amber-200/80 hover:text-white"
              }`}
            >
              Full Chamber
            </button>
            <button
              onClick={() => {
                setCameraView("bench");
                setAutoCam(false);
                playRetroSound("gavel");
              }}
              className={`px-2 py-0.5 rounded transition-all ${
                cameraView === "bench"
                  ? "bg-amber-400 text-slate-950 font-bold shadow"
                  : "text-amber-300/80 hover:text-white"
              }`}
            >
              Bench
            </button>
            <button
              onClick={() => {
                setCameraView("advocate");
                setAutoCam(false);
                playRetroSound("chime");
              }}
              className={`px-2 py-0.5 rounded transition-all ${
                cameraView === "advocate"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow"
                  : "text-emerald-300/80 hover:text-white"
              }`}
            >
              Advocate
            </button>
            <button
              onClick={() => {
                setCameraView("skeptic");
                setAutoCam(false);
                playRetroSound("chime");
              }}
              className={`px-2 py-0.5 rounded transition-all ${
                cameraView === "skeptic"
                  ? "bg-rose-500 text-slate-950 font-bold shadow"
                  : "text-rose-300/80 hover:text-white"
              }`}
            >
              Skeptic
            </button>
          </div>

          {/* Audio & Auto-Cam Controls */}
          <div className="flex items-center gap-1.5 bg-[#0d1627]/90 border-2 border-[#e8d28a]/60 p-1 rounded-xl font-mono text-[10px] backdrop-blur pointer-events-auto shadow-lg">
            <button
              onClick={() => setAutoCam(!autoCam)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-all border ${
                autoCam
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "text-slate-400 border-slate-700 hover:text-white"
              }`}
              title="Toggle Auto Camera"
            >
              <Eye className="w-3 h-3" />
              <span>Auto-Cam</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1 rounded transition-all border ${
                soundEnabled
                  ? "text-amber-300 border-amber-500/40 hover:bg-amber-900/40"
                  : "text-slate-500 border-slate-700 hover:text-slate-300"
              }`}
              title={soundEnabled ? "Mute Retro Audio" : "Enable Retro Audio"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
