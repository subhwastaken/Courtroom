import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        court: {
          dark: "#030712",
          navy: "#0a1128",
          panel: "rgba(10, 20, 45, 0.82)",
          accent: "#f59e0b",
          gold: "#fbbf24",
          advocate: "#10b981",
          skeptic: "#f43f5e",
          judge: "#eab308",
          cyber: "#06b6d4",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "glow-amber": "0 0 25px -3px rgba(245, 158, 11, 0.45)",
        "glow-emerald": "0 0 25px -3px rgba(16, 185, 129, 0.45)",
        "glow-rose": "0 0 25px -3px rgba(244, 63, 94, 0.45)",
        "glow-cyan": "0 0 25px -3px rgba(6, 182, 212, 0.45)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "scan": "scan 6s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scan: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
