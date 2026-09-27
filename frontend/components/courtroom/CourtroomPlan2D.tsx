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
       *  MAIN 2D POKÉMON / NINTENDO RPG COURTROOM FRAME (NEO-BRUTALIST PIXEL BOX)
       * ────────────────────────────────────────────────────────── */}
      <div className="relative w-full aspect-video rounded-none overflow-hidden bg-black border-4 border-black shadow-[8px_8px_0px_#000] select-none">
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
              <div className="absolute inset-0 border-2 border-black bg-neo-yellow/25 shadow-[4px_4px_0px_#FFE600] animate-pulse" />
            )}

            {/* RPG Exclamation Balloon */}
            {activeRole === "judge" && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neo-yellow text-black border-2 border-black font-pixel text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] animate-[rpgIconBob_1.2s_infinite_ease-in-out] flex items-center gap-1">
                <Gavel className="w-2.5 h-2.5 stroke-[2.5]" />
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
              <div className="absolute inset-0 border-2 border-black bg-neo-green/25 shadow-[4px_4px_0px_#05F196] animate-pulse" />
            )}

            {/* RPG Exclamation Balloon */}
            {activeRole === "advocate" && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neo-green text-black border-2 border-black font-pixel text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] animate-[rpgIconBob_1.2s_infinite_ease-in-out] flex items-center gap-1">
                <Scale className="w-2.5 h-2.5 stroke-[2.5]" />
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
              <div className="absolute inset-0 border-2 border-black bg-neo-red/25 shadow-[4px_4px_0px_#FF3366] animate-pulse" />
            )}

            {/* RPG Exclamation Balloon */}
            {activeRole === "skeptic" && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-neo-red text-white border-2 border-black font-pixel text-[8px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000] animate-[rpgIconBob_1.2s_infinite_ease-in-out] flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5 stroke-[2.5]" />
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
         *  AUTHENTIC POKÉMON / NINTENDO RPG DIALOGUE BOX (NEO-BRUTALIST PIXEL BOX)
         * ────────────────────────────────────────────────────────── */}
        <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none">
          <div className="relative bg-[#180d09]/95 border-3 border-black shadow-[6px_6px_0px_#000] p-3 sm:p-4 backdrop-blur flex items-start gap-3.5">
            {/* Speaker Pixel Portrait Mugshot */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 border-2 border-black bg-black flex-shrink-0 overflow-hidden shadow-[2px_2px_0px_#000]">
              <img
                src={
                  activeRole === "advocate"
                    ? "/pixel_advocate_portrait.jpg"
                    : activeRole === "skeptic"
                    ? "/pixel_skeptic_portrait.jpg"
                    : activeRole === "judge"
                    ? "/pixel_judge_portrait.jpg"
                    : "/pixel_judge_portrait.jpg"
                }
                alt="Speaker Portrait"
                className="w-full h-full object-cover pointer-events-none"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            {/* Dialogue Text Content */}
            <div className="flex-1 min-w-0 pr-6">
              {/* Speaker Name Tag */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-pixel text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black shadow-[2px_2px_0px_#000] ${
                    activeRole === "advocate"
                      ? "bg-neo-green text-black"
                      : activeRole === "skeptic"
                      ? "bg-neo-red text-white"
                      : activeRole === "judge"
                      ? "bg-neo-yellow text-black"
                      : "bg-[#26150F] text-neo-yellow"
                  }`}
                >
                  {activeRole === "advocate"
                    ? "ADVOCATE"
                    : activeRole === "skeptic"
                    ? "SKEPTIC"
                    : activeRole === "judge"
                    ? "CHIEF JUSTICE"
                    : "COURT CLERK"}
                </span>
                <span className="font-mono text-[10px] text-[#FFE885] uppercase tracking-wider hidden sm:inline font-bold">
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
              <p className="font-sans text-xs sm:text-sm text-[#FFF8E7] leading-relaxed line-clamp-3">
                {displayedDialogue
                  ? `“${displayedDialogue}”`
                  : "The judicial chamber is assembled. Enter a case dilemma to initiate multi-agent adversarial debate."}
              </p>
            </div>

            {/* Blinking Nintendo RPG Prompt Arrow (▼) */}
            <div className="absolute bottom-2.5 right-3 text-neo-yellow font-pixel text-xs sm:text-sm animate-[rgpBounceArrow_0.8s_infinite_ease-in-out]">
              ▼
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────
         *  TOP HUD CONTROLS (PIXEL NEO-BRUTALIST)
         * ────────────────────────────────────────────────────────── */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1 bg-[#180d09]/95 border-2 sm:border-3 border-black p-1 font-mono text-[10px] text-white pointer-events-auto shadow-[4px_4px_0px_#000]">
            <span className="text-neo-yellow font-black px-1.5 flex items-center gap-1 uppercase">
              <Camera className="w-3 h-3" />
              View:
            </span>
            <button
              onClick={() => {
                setCameraView("full");
                setAutoCam(false);
              }}
              className={`px-2 py-0.5 border border-black font-black uppercase transition-all ${
                cameraView === "full"
                  ? "bg-neo-yellow text-black shadow-[2px_2px_0px_#000]"
                  : "text-[#FFF8E7] hover:text-black hover:bg-neo-yellow"
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
              className={`px-2 py-0.5 border border-black font-black uppercase transition-all ${
                cameraView === "bench"
                  ? "bg-neo-yellow text-black shadow-[2px_2px_0px_#000]"
                  : "text-[#FFE885] hover:text-black hover:bg-amber-300"
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
              className={`px-2 py-0.5 border border-black font-black uppercase transition-all ${
                cameraView === "advocate"
                  ? "bg-neo-green text-black shadow-[2px_2px_0px_#000]"
                  : "text-emerald-300 hover:text-black hover:bg-neo-green"
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
              className={`px-2 py-0.5 border border-black font-black uppercase transition-all ${
                cameraView === "skeptic"
                  ? "bg-neo-red text-white shadow-[2px_2px_0px_#000]"
                  : "text-rose-300 hover:text-white hover:bg-neo-red"
              }`}
            >
              Skeptic
            </button>
          </div>

          {/* Audio & Auto-Cam Controls */}
          <div className="flex items-center gap-1.5 bg-[#180d09]/95 border-2 sm:border-3 border-black p-1 font-mono text-[10px] pointer-events-auto shadow-[4px_4px_0px_#000]">
            <button
              onClick={() => setAutoCam(!autoCam)}
              className={`flex items-center gap-1 px-2 py-1 font-bold uppercase transition-all border border-black ${
                autoCam
                  ? "bg-neo-green text-black shadow-[1px_1px_0px_#000]"
                  : "text-[#FFE885] bg-[#26150F] hover:text-white"
              }`}
              title="Toggle Auto Camera"
            >
              <Eye className="w-3 h-3" />
              <span>Auto-Cam</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1 transition-all border border-black ${
                soundEnabled
                  ? "bg-[#26150F] text-neo-yellow hover:bg-[#382017]"
                  : "text-[#FFE885]/60 bg-[#26150F] hover:text-white"
              }`}
              title={soundEnabled ? "Mute Retro Audio" : "Enable Retro Audio"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#FFE885]/60" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
