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
          gold: "#FFB800",
          green: "#00E676",
          emerald: "#10B981",
          red: "#E52521",
          crimson: "#C62828",
          rose: "#FF3366",
          cream: "#FFF8E7",
          parchment: "#FDF6E2",
          dark: "#120907",
          card: "#1C100B",
          surface: "#26150F",
          border: "#000000",
          paper: "#FFFDF2",
        },
        court: {
          dark: "#120907",
          mahogany: "#1C100B",
          panel: "#26150F",
          accent: "#FFE600",
          gold: "#FFB800",
          red: "#E52521",
          cream: "#FFF8E7",
          advocate: "#00E676",
          skeptic: "#E52521",
          judge: "#FFE600",
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
        "neo-red": "5px 5px 0px #E52521",
        "neo-green": "5px 5px 0px #00E676",
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
