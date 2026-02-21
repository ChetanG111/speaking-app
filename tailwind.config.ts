import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card-bg)",
                accent: {
                    DEFAULT: "#3B82F6", // Blue-500 from design
                    400: "#60A5FA",
                    500: "#3B82F6",
                    600: "#2563EB",
                },
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                mono: ["monospace"], // Default mono
            },
            boxShadow: {
                'glow-blue': '0 0 20px rgba(59,130,246,0.3)',
                'glow-blue-sm': '0 0 8px #3B82F6',
                'glow-blue-lg': '0 0 15px #3B82F6',
            }
        },
    },
    plugins: [],
};
export default config;
