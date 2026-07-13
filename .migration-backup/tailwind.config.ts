import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Almarai", "sans-serif"],
      },
      colors: {
        esaad: {
          green: "#0c6e3e",
          gold: "#c9a227",
          navy: "#1a2b50",
        },
      },
    },
  },
  plugins: [],
};

export default config;
