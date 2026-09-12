import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#08080C",
          surface: "#121319",
          elevated: "#191B24",
          border: "#252732",
        },
        ink: {
          DEFAULT: "#EDEDF4",
          muted: "#9496A8",
          faint: "#5D5F70",
        },
        violet: {
          DEFAULT: "#7C5CFF",
          soft: "#9C85FF",
          deep: "#5636D9",
        },
        cyan: {
          DEFAULT: "#00C2D9",
        },
        ember: {
          DEFAULT: "#F58B3C",
          soft: "#FFAE6E",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,92,255,0.25), transparent)",
        "aurora":
          "conic-gradient(from 180deg at 50% 50%, #7C5CFF, #00C2D9, #5636D9, #7C5CFF)",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(124,92,255,0.55)",
        "glow-ember": "0 0 30px -6px rgba(245,139,60,0.6)",
        panel: "0 8px 30px rgba(0,0,0,0.45)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        spin_slow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse_glow: {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        spin_slow: "spin_slow 30s linear infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        pulse_glow: "pulse_glow 4s ease-in-out infinite",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
