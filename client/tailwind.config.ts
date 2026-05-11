import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0f172a",
          sky: "#37bdf8",
          amber: "#f59e0b",
          mint: "#4ade80",
          rose: "#fb7185"
        }
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at 10% 20%, rgba(55,189,248,0.18), transparent 35%), radial-gradient(circle at 90% 0%, rgba(251,113,133,0.14), transparent 30%), linear-gradient(125deg, #020617 0%, #0b1120 100%)"
      }
    }
  },
  plugins: []
};

export default config;
