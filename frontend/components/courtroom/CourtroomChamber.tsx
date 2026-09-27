"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { AgentTurn, AgentRole } from "@/lib/types";
import {
  Scale,
  Volume2,
  VolumeX,
  Gavel,
  Camera,
  Eye,
  Sparkles,
  Zap,
  ShieldAlert,
  ChevronRight,
  RotateCcw
} from "lucide-react";

export interface CourtroomChamberProps {
  activeTurnIndex: number;
  turns: AgentTurn[];
}

type CameraPreset = "wide" | "advocate" | "judge" | "skeptic";

export function CourtroomChamber({ activeTurnIndex, turns }: CourtroomChamberProps) {
  // ──────────────────────────────────────────────────────────
  //  STATE
  // ──────────────────────────────────────────────────────────
  const [cameraView, setCameraView] = useState<CameraPreset>("wide");
  const [autoTrack, setAutoTrack] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [shockwaveActive, setShockwaveActive] = useState<boolean>(false);
  const [activeBanner, setActiveBanner] = useState<{
    role: AgentRole;
    title: string;
    subtitle: string;
  } | null>(null);

  // Active turn info
  const activeTurn = activeTurnIndex > 0 && turns[activeTurnIndex - 1]
    ? turns[activeTurnIndex - 1]
    : null;
  const activeRole: AgentRole | null = activeTurn ? activeTurn.role : null;
  const activeText = activeTurn ? activeTurn.content : "";

  // Typewriter effect text
  const [displayedText, setDisplayedText] = useState<string>("");
  const typewriterIndexRef = useRef<number>(0);

  // Canvas ref for ambient window dust/light rays
  const dustCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ──────────────────────────────────────────────────────────
  //  SYNTHESIZED WEB AUDIO EFFECTS
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

  const playSound = useCallback((type: "gavel" | "objection" | "argument" | "blip") => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === "gavel") {
        // Wooden gavel strike with double bounce
        const strike = (delay: number, gainVal: number, freq: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + delay);
          osc.frequency.exponentialRampToValueAtTime(45, now + delay + 0.18);

          gain.gain.setValueAtTime(gainVal, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.23);

          // Wood noise burst
          const bufSize = ctx.sampleRate * 0.08;
          const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
          const data = noiseBuf.getChannelData(0);
          for (let i = 0; i < bufSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = noiseBuf;
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 320;
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(gainVal * 0.8, now + delay);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          noise.start(now + delay);
        };

        strike(0, 0.9, 180);
        strike(0.12, 0.45, 140);
      } else if (type === "objection") {
        // Dramatic retro objection chord (Eb -> Bb -> Eb5 fanfare)
        const notes = [311.13, 466.16, 622.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);

          gain.gain.setValueAtTime(0.18, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.46);
        });
      } else if (type === "argument") {
        // Advocate speech start: Wood desk tap + chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "blip") {
        // Subtle micro typewriter blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(750, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    } catch {
      // AudioContext unavailable or autoplay restricted
    }
  }, [soundEnabled, getAudioContext]);

  // ──────────────────────────────────────────────────────────
  //  TRIGGER GAVEL ACTION
  // ──────────────────────────────────────────────────────────
  const triggerGavel = useCallback(() => {
    setIsShaking(true);
    setShockwaveActive(true);
    playSound("gavel");
    setTimeout(() => setIsShaking(false), 550);
    setTimeout(() => setShockwaveActive(false), 850);
  }, [playSound]);

  // ──────────────────────────────────────────────────────────
  //  HANDLE TURN PROGRESSION
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeTurn) {
      setDisplayedText("");
      return;
    }

    // Auto camera track if enabled
    if (autoTrack) {
      if (activeTurn.role === "advocate") {
        setCameraView("advocate");
      } else if (activeTurn.role === "skeptic") {
        setCameraView("skeptic");
      } else if (activeTurn.role === "judge") {
        setCameraView("judge");
      }
    }

    // Dramatic Ace Attorney style Comic Banner
    if (activeTurn.role === "advocate") {
      setActiveBanner({
        role: "advocate",
        title: "✦ PRESENTING ARGUMENT ✦",
        subtitle: "Counsel for Opportunity Presents Case"
      });
      playSound("argument");
    } else if (activeTurn.role === "skeptic") {
      setActiveBanner({
        role: "skeptic",
        title: "⚡ OBJECTION! ⚡",
        subtitle: "Counsel for Caution Intervenes"
      });
      playSound("objection");
    } else if (activeTurn.role === "judge") {
      setActiveBanner({
        role: "judge",
        title: "⚖️ ORDER IN THE COURT! ⚖️",
        subtitle: "The Supreme Bench Delivers the Ruling"
      });
      triggerGavel();
    }

    const bannerTimeout = setTimeout(() => {
      setActiveBanner(null);
    }, 1100);

    // Typewriter effect for dialogue
    setDisplayedText("");
    typewriterIndexRef.current = 0;
    const fullText = activeTurn.content;
    const interval = setInterval(() => {
      typewriterIndexRef.current += 3;
      if (typewriterIndexRef.current >= fullText.length) {
        setDisplayedText(fullText);
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, typewriterIndexRef.current));
      }
    }, 28);

    return () => {
      clearTimeout(bannerTimeout);
      clearInterval(interval);
    };
  }, [activeTurnIndex, turns, autoTrack, playSound, triggerGavel]);

  // ──────────────────────────────────────────────────────────
  //  CANVAS PARTICLES: WINDOW SUNBEAMS & DUST MOTES
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; r: number; speedX: number; speedY: number; a: number }[] = [];

    // Initialize 24 dust motes
    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.6,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.18 - 0.05,
        a: Math.random() * 0.5 + 0.2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soft sunbeams from left and right arched windows
      const leftGrad = ctx.createLinearGradient(0, 50, 240, 340);
      leftGrad.addColorStop(0, "rgba(255, 235, 170, 0.09)");
      leftGrad.addColorStop(1, "rgba(255, 235, 170, 0)");
      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(80, 20);
      ctx.lineTo(260, 420);
      ctx.lineTo(100, 420);
      ctx.closePath();
      ctx.fill();

      const rightGrad = ctx.createLinearGradient(canvas.width, 50, canvas.width - 240, 340);
      rightGrad.addColorStop(0, "rgba(255, 235, 170, 0.09)");
      rightGrad.addColorStop(1, "rgba(255, 235, 170, 0)");
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.moveTo(canvas.width, 20);
      ctx.lineTo(canvas.width - 80, 20);
      ctx.lineTo(canvas.width - 260, 420);
      ctx.lineTo(canvas.width - 100, 420);
      ctx.closePath();
      ctx.fill();

      // Floating dust particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(255, 225, 150, ${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // ──────────────────────────────────────────────────────────
  //  CAMERA TRANSFORM STYLES
  // ──────────────────────────────────────────────────────────
  const getCameraTransform = () => {
    switch (cameraView) {
      case "advocate":
        return "scale(1.42) translate(19%, 3%)";
      case "judge":
        return "scale(1.5) translate(0%, 14%)";
      case "skeptic":
        return "scale(1.42) translate(-19%, 3%)";
      case "wide":
      default:
        return "scale(1) translate(0%, 0%)";
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <style jsx global>{`
        @keyframes advocateArgue {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-3px) rotate(-0.5deg) scale(1.02); }
          50% { transform: translateY(0px) rotate(0.4deg) scale(1.01); }
          75% { transform: translateY(-2px) rotate(0deg) scale(1.015); }
        }
        @keyframes skepticPoint {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          20% { transform: translateY(-3px) translateX(-3px) scale(1.02); }
          50% { transform: translateY(0px) translateX(-1px) scale(1.01); }
          75% { transform: translateY(-2px) translateX(-2px) scale(1.02); }
        }
        @keyframes judgeDeliberate {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.02); }
        }
        @keyframes gavelShakeAnim {
          0% { transform: translate(0, 0) rotate(0deg); }
          15% { transform: translate(-5px, 4px) rotate(-0.6deg); }
          30% { transform: translate(6px, -4px) rotate(0.6deg); }
          45% { transform: translate(-4px, 2px) rotate(-0.4deg); }
          60% { transform: translate(3px, -2px) rotate(0.3deg); }
          75% { transform: translate(-2px, 1px) rotate(-0.1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes sconceFlicker {
          0%, 100% { opacity: 0.82; filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.7)); }
          30% { opacity: 0.95; filter: drop-shadow(0 0 14px rgba(251, 191, 36, 0.9)); }
          65% { opacity: 0.76; filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6)); }
        }
        @keyframes shockwaveRing {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        }
        @keyframes bannerSlideIn {
          0% { transform: translateY(-50%) translateX(-120%) skewX(-12deg); opacity: 0; }
          40% { transform: translateY(-50%) translateX(0%) skewX(-12deg); opacity: 1; }
          80% { transform: translateY(-50%) translateX(0%) skewX(-12deg); opacity: 1; }
          100% { transform: translateY(-50%) translateX(120%) skewX(-12deg); opacity: 0; }
        }
        @keyframes eqBounce {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>

      {/* ──────────────────────────────────────────────────────────
       *  MAIN RETRO COURTROOM FRAME (NEO-BRUTALIST PIXEL BOX)
       * ────────────────────────────────────────────────────────── */}
      <div
        className={`relative w-full aspect-video rounded-none overflow-hidden bg-black border-4 border-black shadow-[8px_8px_0px_#000] select-none ${
          isShaking ? "animate-[gavelShakeAnim_0.5s_ease-in-out]" : ""
        }`}
      >
        {/* VIEWPORT WITH CINEMATIC ZOOM / PAN */}
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          style={{ transform: getCameraTransform() }}
        >
          {/* Base Pixel-Art Courtroom Illustration */}
          <img
            src="/courtroom_pixel_reference.jpg"
            alt="Supreme Courtroom Pixel Art"
            className="w-full h-full object-cover pointer-events-none"
            style={{
              imageRendering: "pixelated",
            }}
          />

          {/* Canvas for ambient floating dust motes & window sunbeams */}
          <canvas
            ref={dustCanvasRef}
            width={1024}
            height={576}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Wall Sconces Ambient Warm Light Flicker */}
          <div
            className="absolute w-12 h-12 rounded-full pointer-events-none animate-[sconceFlicker_3s_infinite_ease-in-out]"
            style={{ left: "19%", top: "16%", background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)" }}
          />
          <div
            className="absolute w-12 h-12 rounded-full pointer-events-none animate-[sconceFlicker_3.4s_infinite_ease-in-out]"
            style={{ right: "19%", top: "16%", background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)" }}
          />

          {/* ──────────────────────────────────────────────────────────
           *  ADVOCATE ZONE (LEFT LAWYER)
           * ────────────────────────────────────────────────────────── */}
          <div
            onClick={() => {
              setCameraView("advocate");
              playSound("argument");
            }}
            className="absolute cursor-pointer group"
            style={{
              left: "9.765625%",
              top: "26.041666%",
              width: "23.4375%",
              height: "52.083333%",
            }}
            title="Advocate • Counsel for Opportunity (Click to Focus)"
          >
            {/* Downward Spotlight Beam when Advocate is speaking */}
            {activeRole === "advocate" && (
              <div
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-48 h-72 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, rgba(52, 211, 153, 0.32) 0%, rgba(52, 211, 153, 0.02) 100%)",
                  clipPath: "polygon(40% 0%, 60% 0%, 95% 100%, 5% 100%)",
                }}
              />
            )}

            {/* Advocate Cutout Sprite with Active Speech / Idle Hover Animation */}
            <img
              src="/sprite_cutout_advocate.png"
              alt="Advocate Character"
              className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
                activeRole === "advocate"
                  ? "animate-[advocateArgue_2.2s_infinite_ease-in-out] drop-shadow-[0_0_14px_rgba(52,211,153,0.85)] filter brightness-110"
                  : "group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              }`}
              style={{ imageRendering: "pixelated" }}
            />

            {/* Speaking Audio Equalizer Bars on Desk */}
            {activeRole === "advocate" && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 bg-black/70 px-2 py-1 rounded border border-emerald-400/60 shadow-lg">
                <span className="w-1 bg-emerald-400 rounded-sm animate-[eqBounce_0.6s_infinite_ease-in-out]" />
                <span className="w-1 bg-emerald-400 rounded-sm animate-[eqBounce_0.4s_infinite_ease-in-out_0.15s]" />
                <span className="w-1 bg-emerald-400 rounded-sm animate-[eqBounce_0.7s_infinite_ease-in-out_0.3s]" />
                <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider ml-1">
                  ARGUES
                </span>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────
           *  SKEPTIC ZONE (RIGHT LAWYER)
           * ────────────────────────────────────────────────────────── */}
          <div
            onClick={() => {
              setCameraView("skeptic");
              playSound("objection");
            }}
            className="absolute cursor-pointer group"
            style={{
              left: "68.359375%",
              top: "26.041666%",
              width: "23.4375%",
              height: "52.083333%",
            }}
            title="Skeptic • Counsel for Caution (Click to Focus)"
          >
            {/* Downward Spotlight Beam when Skeptic is speaking */}
            {activeRole === "skeptic" && (
              <div
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-48 h-72 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, rgba(244, 63, 94, 0.32) 0%, rgba(244, 63, 94, 0.02) 100%)",
                  clipPath: "polygon(40% 0%, 60% 0%, 95% 100%, 5% 100%)",
                }}
              />
            )}

            {/* Skeptic Cutout Sprite with Active Speech / Idle Hover Animation */}
            <img
              src="/sprite_cutout_skeptic.png"
              alt="Skeptic Character"
              className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
                activeRole === "skeptic"
                  ? "animate-[skepticPoint_2s_infinite_ease-in-out] drop-shadow-[0_0_14px_rgba(244,63,94,0.85)] filter brightness-110"
                  : "group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              }`}
              style={{ imageRendering: "pixelated" }}
            />

            {/* Speaking Audio Equalizer Bars on Desk */}
            {activeRole === "skeptic" && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1 bg-black/70 px-2 py-1 rounded border border-rose-400/60 shadow-lg">
                <span className="w-1 bg-rose-400 rounded-sm animate-[eqBounce_0.5s_infinite_ease-in-out]" />
                <span className="w-1 bg-rose-400 rounded-sm animate-[eqBounce_0.7s_infinite_ease-in-out_0.2s]" />
                <span className="w-1 bg-rose-400 rounded-sm animate-[eqBounce_0.4s_infinite_ease-in-out_0.35s]" />
                <span className="text-[9px] font-mono text-rose-300 font-bold uppercase tracking-wider ml-1">
                  OBJECTS
                </span>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────
           *  JUDGE ZONE (ELEVATED CENTER BENCH)
           * ────────────────────────────────────────────────────────── */}
          <div
            onClick={() => {
              setCameraView("judge");
              triggerGavel();
            }}
            className="absolute cursor-pointer group"
            style={{
              left: "41.015625%",
              top: "19.097222%",
              width: "17.578125%",
              height: "38.194444%",
            }}
            title="Chief Justice • Supreme Deliberation (Click to Focus & Strike Gavel)"
          >
            {/* Celestial Golden Light Beam from Scales of Justice Emblem */}
            {activeRole === "judge" && (
              <div
                className="absolute -top-28 left-1/2 -translate-x-1/2 w-48 h-64 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 0%, rgba(234, 179, 8, 0.45) 0%, rgba(234, 179, 8, 0.05) 75%, transparent 100%)",
                }}
              />
            )}

            {/* Gavel Strike Shockwave Ring */}
            {shockwaveActive && (
              <div
                className="absolute left-1/2 top-3/4 w-32 h-32 rounded-full border-2 border-amber-400 pointer-events-none animate-[shockwaveRing_0.8s_ease-out]"
              />
            )}

            {/* Judge Cutout Sprite */}
            <img
              src="/sprite_cutout_judge.png"
              alt="Chief Justice Character"
              className={`w-full h-full object-contain pointer-events-none transition-all duration-300 ${
                activeRole === "judge"
                  ? "animate-[judgeDeliberate_2.4s_infinite_ease-in-out] drop-shadow-[0_0_18px_rgba(234,179,8,0.9)] filter brightness-115"
                  : "group-hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.7)]"
              }`}
              style={{ imageRendering: "pixelated" }}
            />

            {/* Supreme Ruling Badge */}
            {activeRole === "judge" && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#231508]/95 px-2.5 py-1 rounded border border-amber-400/80 shadow-[0_0_15px_rgba(234,179,8,0.4)] whitespace-nowrap">
                <Gavel className="w-3 h-3 text-amber-300 animate-bounce" />
                <span className="text-[9px] font-mono text-amber-200 font-bold uppercase tracking-wider">
                  RULING IN PROGRESS
                </span>
              </div>
            )}
          </div>

          {/* ──────────────────────────────────────────────────────────
           *  SPEECH BUBBLE OVERLAYS (COMPACT COMIC BALLOONS SAFELY POSITIONED ABOVE FACES)
           * ────────────────────────────────────────────────────────── */}
          {activeRole === "advocate" && (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-300"
              style={{ left: "3%", top: "2%", maxWidth: "28%" }}
            >
              <div className="relative bg-[#0d2215]/95 border-2 border-black shadow-[3px_3px_0px_#05F196] px-2.5 py-1.5 text-[#FFF8E7] flex flex-col gap-1 max-w-[210px] sm:max-w-[240px]">
                <div className="flex items-center justify-between pb-0.5 border-b border-neo-green/30">
                  <span className="font-pixel text-[8px] font-black uppercase tracking-wider text-neo-green flex items-center gap-1">
                    <Scale className="w-2.5 h-2.5 text-neo-green stroke-[2.5]" />
                    THE ADVOCATE
                  </span>
                  <span className="w-1.5 h-1.5 bg-neo-green border border-black animate-ping" />
                </div>
                <p className="font-sans text-[10px] sm:text-[11px] leading-tight text-[#FFF8E7] line-clamp-2 font-bold">
                  &ldquo;{displayedText}&rdquo;
                </p>
                {/* Compact tail pointing down toward Advocate */}
                <div
                  className="absolute -bottom-1.5 left-10 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-black"
                />
              </div>
            </div>
          )}

          {activeRole === "skeptic" && (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-300"
              style={{ right: "3%", top: "2%", maxWidth: "28%" }}
            >
              <div className="relative bg-[#280c14]/95 border-2 border-black shadow-[3px_3px_0px_#E52521] px-2.5 py-1.5 text-[#FFF8E7] flex flex-col gap-1 max-w-[210px] sm:max-w-[240px]">
                <div className="flex items-center justify-between pb-0.5 border-b border-neo-red/30">
                  <span className="font-pixel text-[8px] font-black uppercase tracking-wider text-neo-red flex items-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5 text-neo-red stroke-[2.5]" />
                    THE SKEPTIC
                  </span>
                  <span className="w-1.5 h-1.5 bg-neo-red border border-black animate-ping" />
                </div>
                <p className="font-sans text-[10px] sm:text-[11px] leading-tight text-[#FFF8E7] line-clamp-2 font-bold">
                  &ldquo;{displayedText}&rdquo;
                </p>
                {/* Compact tail pointing down toward Skeptic */}
                <div
                  className="absolute -bottom-1.5 right-10 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-black"
                />
              </div>
            </div>
          )}

          {activeRole === "judge" && (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-300 -translate-x-1/2"
              style={{ left: "50%", top: "1.5%", maxWidth: "30%" }}
            >
              <div className="relative bg-[#1c1508]/95 border-2 border-black shadow-[3px_3px_0px_#FFE600] px-2.5 py-1.5 text-[#FFF8E7] flex flex-col gap-1 max-w-[220px] sm:max-w-[250px]">
                <div className="flex items-center justify-between pb-0.5 border-b border-neo-yellow/30">
                  <span className="font-pixel text-[8px] font-black uppercase tracking-wider text-neo-yellow flex items-center gap-1">
                    <Gavel className="w-2.5 h-2.5 text-neo-yellow stroke-[2.5]" />
                    CHIEF JUSTICE
                  </span>
                  <span className="w-1.5 h-1.5 bg-neo-yellow border border-black animate-ping" />
                </div>
                <p className="font-sans text-[10px] sm:text-[11px] leading-tight text-[#FFF8E7] line-clamp-2 font-bold">
                  &ldquo;{displayedText}&rdquo;
                </p>
                {/* Compact tail pointing down toward Judge */}
                <div
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-black"
                />
              </div>
            </div>
          )}

          {/* Ambient idle notice when waiting for deliberation */}
          {!activeRole && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#180d09]/95 border-3 border-black px-4 py-1.5 shadow-[4px_4px_0px_#000] flex items-center gap-2 pointer-events-none">
              <span className="w-2.5 h-2.5 bg-neo-yellow border border-black animate-pulse" />
              <span className="font-pixel text-[9px] text-[#FFF8E7] font-black uppercase tracking-widest">
                CHAMBER ASSEMBLED • 2 ADVOCATES & 1 BENCH JUDGE
              </span>
            </div>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────
         *  DRAMATIC PHOENIX WRIGHT COMIC IMPACT BANNER
         * ────────────────────────────────────────────────────────── */}
        {activeBanner && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 z-30 pointer-events-none flex justify-center overflow-hidden">
            <div
              className={`px-8 py-3.5 border-4 border-black shadow-[8px_8px_0px_#000] animate-[bannerSlideIn_1.1s_cubic-bezier(0.16,1,0.3,1)_forwards] ${
                activeBanner.role === "advocate"
                  ? "bg-neo-green text-black"
                  : activeBanner.role === "skeptic"
                  ? "bg-neo-red text-white"
                  : "bg-neo-yellow text-black"
              }`}
            >
              <div className="font-pixel text-sm sm:text-lg font-black uppercase tracking-wider text-center drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                {activeBanner.title}
              </div>
              <div className="font-mono text-[10px] sm:text-xs font-bold text-center mt-1 tracking-wider uppercase">
                {activeBanner.subtitle}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────
         *  TOP HUD: CAMERA PRESETS, GAVEL, SOUND TOGGLE (NEO-BRUTALIST PIXEL)
         * ────────────────────────────────────────────────────────── */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          {/* Camera View Switcher */}
          <div className="flex items-center gap-1 bg-[#180d09]/95 border-2 sm:border-3 border-black p-1 font-mono text-[10px] text-white pointer-events-auto shadow-[4px_4px_0px_#000]">
            <span className="text-neo-yellow font-black px-1.5 flex items-center gap-1 uppercase">
              <Camera className="w-3 h-3" />
              Focus:
            </span>
            <button
              onClick={() => {
                setCameraView("wide");
                setAutoTrack(false);
              }}
              className={`px-2 py-0.5 border border-black font-black uppercase transition-all ${
                cameraView === "wide"
                  ? "bg-neo-yellow text-black shadow-[2px_2px_0px_#000]"
                  : "text-[#FFF8E7] hover:text-black hover:bg-neo-yellow"
              }`}
            >
              Chamber
            </button>
            <button
              onClick={() => {
                setCameraView("advocate");
                setAutoTrack(false);
                playSound("argument");
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
                setCameraView("judge");
                setAutoTrack(false);
                triggerGavel();
              }}
              className={`px-2 py-0.5 border border-black font-black uppercase transition-all ${
                cameraView === "judge"
                  ? "bg-neo-yellow text-black shadow-[2px_2px_0px_#000]"
                  : "text-[#FFE885] hover:text-black hover:bg-amber-300"
              }`}
            >
              Chief Justice
            </button>
            <button
              onClick={() => {
                setCameraView("skeptic");
                setAutoTrack(false);
                playSound("objection");
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

          {/* Quick Action Controls: Gavel & Sound */}
          <div className="flex items-center gap-1.5 bg-[#180d09]/95 border-2 sm:border-3 border-black p-1 font-mono text-[10px] pointer-events-auto shadow-[4px_4px_0px_#000]">
            {/* Strike Gavel Button */}
            <button
              onClick={triggerGavel}
              className="neo-btn flex items-center gap-1 px-2.5 py-1 bg-neo-yellow text-black font-black uppercase border border-black shadow-[2px_2px_0px_#000] hover:bg-amber-300 transition-all active:translate-x-[1px] active:translate-y-[1px]"
              title="Strike Gavel (Calls Court to Order)"
            >
              <Gavel className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>Gavel</span>
            </button>

            {/* Auto Track Toggle */}
            <button
              onClick={() => setAutoTrack(!autoTrack)}
              className={`flex items-center gap-1 px-2 py-1 font-bold uppercase transition-all border border-black ${
                autoTrack
                  ? "bg-neo-green text-black shadow-[1px_1px_0px_#000]"
                  : "text-[#FFE885] bg-[#26150F] hover:text-white"
              }`}
              title="Toggle Auto Camera Following Speaker"
            >
              <Eye className="w-3 h-3" />
              <span>Auto-Cam</span>
            </button>

            {/* Sound Toggle */}
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

        {/* ──────────────────────────────────────────────────────────
         *  BOTTOM HUD: COURT STATUS & SPEAKER DOSSIER BAR (NEO-BRUTALIST PIXEL)
         * ────────────────────────────────────────────────────────── */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          {/* Counsel Stance Indicator */}
          <div className="flex items-center gap-2 bg-[#180d09]/95 border-2 sm:border-3 border-black px-3.5 py-1.5 font-mono text-[10px] text-white pointer-events-auto shadow-[4px_4px_0px_#000]">
            <Scale className="w-3.5 h-3.5 text-neo-yellow flex-shrink-0 stroke-[2.5]" />
            <div className="truncate max-w-[280px] sm:max-w-md">
              {activeRole === "advocate" ? (
                <span className="text-neo-green font-bold">
                  Advocate argues in favor • Seizing opportunity
                </span>
              ) : activeRole === "skeptic" ? (
                <span className="text-neo-red font-bold">
                  Skeptic cautions against risk • Preserving stability
                </span>
              ) : activeRole === "judge" ? (
                <span className="text-neo-yellow font-bold">
                  Chief Justice weighing historical precedent & decisive ruling
                </span>
              ) : (
                <span className="text-[#FFF8E7]">
                  Chamber awaiting deliberation • 2 Lawyers & 1 Judge on bench
                </span>
              )}
            </div>
          </div>

          {/* Reset Camera to Wide View */}
          {cameraView !== "wide" && (
            <button
              onClick={() => {
                setCameraView("wide");
                setAutoTrack(true);
              }}
              className="neo-btn pointer-events-auto flex items-center gap-1.5 bg-neo-yellow text-black border-2 border-black px-3 py-1 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] hover:bg-amber-300 transition-all"
            >
              <RotateCcw className="w-3 h-3 stroke-[2.5]" />
              <span>Full Chamber</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
