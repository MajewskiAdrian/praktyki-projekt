/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // to wymusza tryb na klasie zamiast prefers-color-scheme
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // używamy zmiennej CSS, dzięki temu kolor można zmieniać runtime'owo
        accent: "var(--accent)",
        // obsługa opacity: używamy "rgb(var(--accent) / <alpha-value>)"
        "accent-50": "rgb(var(--accent-50) / <alpha-value>)",
        "accent-500": "rgb(var(--accent-500) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
