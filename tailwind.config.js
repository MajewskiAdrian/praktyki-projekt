/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // to wymusza tryb na klasie zamiast prefers-color-scheme
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
