/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#4f46e5",
        "severity-critical": "#ef4444",
        "severity-high": "#f97316",
        "severity-medium": "#f59e0b",
        "severity-low": "#3b82f6",
        "severity-success": "#10b981",
      },
    },
  },
  plugins: [],
};
