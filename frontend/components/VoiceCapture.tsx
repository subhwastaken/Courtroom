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
    <div className="flex flex-col items-center gap-1.5 select-none">
      <button
        type="button"
        onClick={toggleListen}
        disabled={disabled || !supported}
        className={`
          neo-btn flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-widest font-black border-2 border-black
          ${
            listening
              ? "bg-neo-red text-white shadow-[3px_3px_0px_#000] animate-pulse"
              : "bg-[#182337] text-neo-green shadow-[3px_3px_0px_#000] hover:bg-[#202e47]"
          }
          ${disabled || !supported ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        title={supported ? "Voice Capture (Ambient Mic Mode)" : "Speech recognition not supported in this browser"}
      >
        {listening ? (
          <>
            <Radio className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Recording Dilemma...</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-neo-green stroke-[2.5]" />
            <span>Speak Your Case</span>
          </>
        )}
      </button>

      {/* Interim live transcript feedback */}
      {listening && interimText && (
        <div className="text-[11px] font-mono text-neo-yellow bg-black border-2 border-black shadow-[2px_2px_0px_#000] px-3 py-1 max-w-sm text-center truncate">
          &ldquo;{interimText}&rdquo;
        </div>
      )}
    </div>
  );
}
