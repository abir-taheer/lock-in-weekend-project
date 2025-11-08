/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
        },
        secondary: "#64748b",
      },
      spacing: {
        section: "2rem",
        container: "1rem",
      },
      borderRadius: {
        container: "0.5rem",
      },
      fontFamily: {
        sans: ['"Afacad"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
