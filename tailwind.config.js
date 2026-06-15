/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#071412",
        eco: {
          50: "#effdf6",
          100: "#d8f9e7",
          300: "#66e0a3",
          400: "#2ed17e",
          500: "#12b76a",
          600: "#079455"
        }
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Manrope", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 45px rgba(46, 209, 126, .2)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fadeUp .55s ease-out both"
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        fadeUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } }
      }
    }
  },
  plugins: []
};
