// Web Audio API Synthesizer for Cyber-Courtroom HUD Sound FX
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    // audio mute safe
  }
}

export function playAgentSpeakSound(role: "advocate" | "skeptic" | "judge") {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const freqMap = {
      advocate: 520, // optimistic higher tone
      skeptic: 340,  // cautious deeper tone
      judge: 260,    // authoritative bass
    };

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freqMap[role], ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freqMap[role] * 1.2, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // silent fallback
  }
}

export function playGavelStrikeSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Layer 1: Heavy wooden thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);

    // Layer 2: Metallic echo ring
    const echo = ctx.createOscillator();
    const echoGain = ctx.createGain();
    echo.type = "triangle";
    echo.frequency.setValueAtTime(880, ctx.currentTime);
    echo.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.6);
    echoGain.gain.setValueAtTime(0.2, ctx.currentTime);
    echoGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    echo.connect(echoGain);
    echoGain.connect(ctx.destination);
    echo.start();
    echo.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // silent fallback
  }
}
