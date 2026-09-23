import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        card: "var(--card)",
        border: "var(--border)",
        primary: "var(--primary)",
        verified: "var(--verified)",
        "muted-foreground": "var(--muted-foreground)",
        destructive: "var(--destructive)",
        success: "var(--success)",
        blue: "var(--blue)",
        violet: "var(--violet)",
        "chart-gray": "var(--chart-gray)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
