/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        'custom-brown': '#DED4CA',
        'custom-border': '#F0E5DB',
      },
      keyframes: {
        parallax: {
          '0%': { transform: 'translateY(0) scale(1.1)' },
          '50%': { transform: 'translateY(-10px) scale(1.1)' },
          '100%': { transform: 'translateY(0) scale(1.1)' },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }, // scroll effect for continuous content
        },
      },
      animation: {
        parallax: 'parallax 20s infinite linear',
        scroll: 'scroll 0s linear infinite', // adjust duration for slower scrolling
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};
