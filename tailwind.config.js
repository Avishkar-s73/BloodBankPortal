/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C62828",
          light: "#EF5350",
          dark: "#B71C1C",
        },
        success: {
          DEFAULT: "#2E7D32",
          light: "#4CAF50",
          dark: "#1B5E20",
        },
        warning: {
          DEFAULT: "#EF6C00",
          light: "#FF9800",
          dark: "#E65100",
        },
        error: {
          DEFAULT: "#D32F2F",
          light: "#F44336",
          dark: "#C62828",
        },
        info: {
          DEFAULT: "#1976D2",
          light: "#2196F3",
          dark: "#0D47A1",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
