/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        rescue: {
          500: "#f97316",
          700: "#c2410c",
        },
      },
      boxShadow: {
        panel: "0 20px 50px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};
