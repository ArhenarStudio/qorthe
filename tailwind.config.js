/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: { light: "#FAF8F5", dark: "#1A1A1A" },
        foreground: { light: "#1A1A1A", dark: "#FAF8F5" },
        secondary: { DEFAULT: "#D4C5B0", foreground: "#1A1A1A" },
        accent: { DEFAULT: "#8B7355", foreground: "#FAF8F5" },
        muted: { DEFAULT: "#E8E2D8", foreground: "#6B5E4F" },
        cream: "#FAF8F5",
        walnut: "#8B7355",
        sand: "#D4C5B0",
        taupe: "#6B5E4F",
      },
      fontFamily: {
        sans: ["ITC Avant Garde Gothic Pro", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.625rem",
      },
    },
  },
  plugins: [],
};
