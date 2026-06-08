/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          lila: "#E7DAF6",
          lavanda: "#E5ACF9",
          morado: "#7044BF",
          celeste: "#92DCF9",
          celesteDark: "#62B2D7",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
