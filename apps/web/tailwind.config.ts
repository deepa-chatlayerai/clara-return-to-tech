import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF8",
        surface: "#FFFFFF",
        "text-primary": "#1C1917",
        "text-muted": "#78716C",
        border: "#E7E5E4",
        primary: {
          DEFAULT: "#7C6AF7",
          50: "#F3F1FF",
          100: "#EAE7FE",
          200: "#D5D0FD",
          300: "#B8B0FB",
          400: "#9A8EF9",
          500: "#7C6AF7",
          600: "#6452E5",
          700: "#4F3FC8",
          800: "#3D2FA0",
          900: "#2E2278",
        },
        accent: {
          DEFAULT: "#F59E6B",
          light: "#FEF3EB",
        },
        success: {
          DEFAULT: "#34D399",
          light: "#ECFDF5",
        },
        warning: {
          DEFAULT: "#FBBF24",
          light: "#FFFBEB",
        },
        danger: {
          DEFAULT: "#F87171",
          light: "#FEF2F2",
        },
      },
      fontFamily: {
        heading: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)",
        modal: "0 20px 60px rgba(0,0,0,0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
