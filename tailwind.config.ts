import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./services/**/*.{js,ts,jsx,tsx,mdx}", // just in case
    ],
    theme: {
        extend: {
            colors: {
                background: '#0B0C0F',
                surface: '#13141A',
                elevated: '#1A1B22',
                primary: '#EAEAEA',
                secondary: '#A1A1AA',
                accent: '#FFFFFF'
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [],
};
export default config;
