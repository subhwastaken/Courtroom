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
        neo: {
          yellow: "#FFE600",
          gold: "#FFCC00",
          green: "#05F196",
          emerald: "#10B981",
          red: "#FF3366",
          rose: "#F43F5E",
          blue: "#3366FF",
          purple: "#9933FF",
          dark: "#0E131F",
          card: "#161B26",
          border: "#000000",
          paper: "#FFFDF2",
        },
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
        pixel: ["'Press Start 2P'", "monospace"],
        mono: ["'Space Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "neo": "4px 4px 0px #000000",
        "neo-sm": "2px 2px 0px #000000",
        "neo-lg": "8px 8px 0px #000000",
        "neo-xl": "12px 12px 0px #000000",
        "neo-gold": "5px 5px 0px #FFE600",
        "neo-emerald": "5px 5px 0px #05F196",
        "neo-rose": "5px 5px 0px #FF3366",
      },
      animation: {
        "marquee": "marquee 22s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "pixel-bounce": "pixelBounce 1s infinite ease-in-out",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pixelBounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
