"use client";
import React from "react";

interface HUDPanelProps {
  label: string;
  value: string | number;
  live?: boolean;
  icon?: React.ReactNode;
  positionClass?: string;
  color?: "amber" | "emerald" | "cyan" | "rose";
}

export function HUDPanel({
  label,
  value,
  live = false,
  icon,
  positionClass = "",
  color = "amber",
}: HUDPanelProps) {
  const colorBorders = {
    amber: "border-amber-500/40 text-amber-400",
    emerald: "border-emerald-500/40 text-emerald-400",
    cyan: "border-cyan-500/40 text-cyan-400",
    rose: "border-rose-500/40 text-rose-400",
  };

  const badgeColor = colorBorders[color] || colorBorders.amber;

  return (
    <div
      className={`hud-panel rounded-lg px-4 py-2.5 font-mono shadow-2xl transition-all duration-300 hover:border-amber-400/60 ${positionClass}`}
    >
      <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase">
        {live && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
        {icon && <span className="opacity-80">{icon}</span>}
        <span className={badgeColor}>{label}</span>
      </div>
      <div className="text-sm font-semibold text-slate-100 tracking-wide mt-0.5">
        {value}
      </div>
    </div>
  );
}
