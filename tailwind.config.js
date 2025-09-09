/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Theme colors that will be populated by CSS custom properties
        theme: {
          primary: "var(--color-primary)",
          background: "var(--color-background)",
          card: "var(--color-card)",
          text: "var(--color-text)",
          border: "var(--color-border)",
          notification: "var(--color-notification)",
        },
      },
    },
  },
  plugins: [],
};
