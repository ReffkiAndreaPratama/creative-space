/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cinematic dark editorial palette
        background: "#0a0a0a",
        surface: {
          DEFAULT: "#161616",
          raised: "#1e1e1e",
          hover: "#252525",
        },
        foreground: "#f0ede8", // off-white
        muted: {
          DEFAULT: "#8a8580", // muted gray
          foreground: "#a09b94",
        },
        accent: {
          DEFAULT: "#c8896b", // muted orange
          hover: "#d49b7c",
          foreground: "#0a0a0a",
        },
        border: "#2a2a2a",
        input: "#2a2a2a",
        ring: "#3a3a3a",
        destructive: {
          DEFAULT: "#b54848",
          foreground: "#f0ede8",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 6vw, 5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
