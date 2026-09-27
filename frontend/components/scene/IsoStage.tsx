"use client";
import React from "react";

export function IsoStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-[580px] lg:h-[640px] flex items-center justify-center overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-950/40 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Isometric 3D Projection Container */}
      <div
        className="relative preserve-3d transition-transform duration-700 ease-out"
        style={{
          perspective: "1200px",
        }}
      >
        <div
          className="relative preserve-3d flex items-center justify-center"
          style={{
            transform: "rotateX(58deg) rotateZ(-38deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Isometric Courtroom Base Platform (Floor Slab) */}
          <div
            className="absolute w-[820px] h-[520px] rounded-3xl iso-grid border-2 border-amber-500/20 shadow-[0_0_80px_rgba(245,158,11,0.15)] bg-slate-950/90"
            style={{
              transform: "translateZ(-40px)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.9), inset 0 0 60px rgba(6,182,212,0.1)",
            }}
          >
            {/* Center Court Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-64 h-64 rounded-full border border-amber-400 border-dashed animate-spin-slow" />
              <div className="absolute font-mono text-[9px] uppercase tracking-widest text-amber-300">
                COURTROOM MODE // LYZR ENGINE
              </div>
            </div>
          </div>

          {/* Children: The 3 Agent Podiums */}
          <div className="relative z-10 preserve-3d py-10 px-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
