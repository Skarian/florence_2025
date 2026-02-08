/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        ash: "rgb(var(--color-ash) / <alpha-value>)",
        slate: "rgb(var(--color-slate) / <alpha-value>)",
        fog: "rgb(var(--color-fog) / <alpha-value>)",
        bright: "rgb(var(--color-bright) / <alpha-value>)",
        ember: "rgb(var(--color-ember) / <alpha-value>)",
        olive: "rgb(var(--color-olive) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      boxShadow: {
        soft: "0 18px 40px rgba(5, 5, 15, 0.35)",
        strong: "0 22px 60px rgba(5, 5, 15, 0.55)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        body: ["var(--font-body)", "ui-serif", "Georgia"],
      },
    },
  },
  plugins: [],
};
