import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          green: "var(--accent-green)",
          purple: "var(--accent-purple)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
