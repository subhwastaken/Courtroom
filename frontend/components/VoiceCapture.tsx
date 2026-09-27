"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mic, Radio } from "lucide-react";
import { ingestVoiceTranscript } from "@/lib/api";

interface VoiceCaptureProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceCapture({ onTranscript, disabled = false }: VoiceCaptureProps) {
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInterimText(currentTranscript);
          if (event.results[0].isFinal) {
            onTranscript(currentTranscript);
            // Ingest to vector profile in background
            ingestVoiceTranscript(currentTranscript).catch(() => {});
            setListening(false);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
          setListening(false);
        };

        recognition.onend = () => {
          setListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSupported(false);
      }
    }
  }, [onTranscript]);

  const toggleListen = () => {
    if (disabled) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      setInterimText("");
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={toggleListen}
        disabled={disabled || !supported}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-all duration-200
          ${
            listening
              ? "bg-rose-500 text-white shadow-glow-rose animate-pulse"
              : "bg-slate-900/90 text-amber-400 border border-amber-500/40 hover:bg-amber-500/20 hover:border-amber-400"
          }
          ${disabled || !supported ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
        `}
        title={supported ? "Voice Capture (Omi Mode)" : "Speech recognition not supported in this browser"}
      >
        {listening ? (
          <>
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>Listening to Case...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5" />
            <span>Speak Your Case</span>
          </>
        )}
      </button>

      {/* Interim live transcript feedback */}
      {listening && interimText && (
        <div className="text-[11px] font-mono text-amber-300 bg-slate-950/90 px-3 py-1 rounded border border-amber-500/30 max-w-sm text-center truncate">
          "{interimText}"
        </div>
      )}
    </div>
  );
}
