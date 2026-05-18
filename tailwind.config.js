/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      animation: {
        "slide-down": "slide-down 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "slide-down": {
          "0%": { transform: "translateY(-20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
