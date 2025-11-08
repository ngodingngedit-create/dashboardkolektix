import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
      ringColor: {
        DEFAULT: "transparent",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
    },
    colors: {
      "primary-base": "#194E9E",
      "primary-disabled": "#5e83b9",
      "primary-light": "#F5FAFF",
      "primary-dark": "#0b387c",
      "primary-darker": "#02255a",
      "primary-light-200": "#E2EEFE",

      // 🎨 tambahan baru:
      "primary-light-700": "#1453b6", // untuk hover (sedikit lebih terang dari dark)
      "primary-light-800": "#0d3e91", // untuk active (lebih gelap dari base, tapi belum sampai darker)

      white: "#FFFFFF",
      dark: "#000000",
      grey: "#8f8f8f",
      "dark-grey": "#666666",
      "light-grey": "#e4e4e7",
    },
  },
  plugins: [
    nextui({
      addCommonColors: true,

      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: "#0b387c",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#E2EEFE",
              foreground: "#000000",
            },
          },
        },
        light: {
          colors: {
            primary: {
              DEFAULT: "#08325c",
              foreground: "#ffffff",
            },
            secondary: {
              DEFAULT: "#F5FAFF",
              foreground: "#000000",
            },
          },
        },
      },
    }),
  ],
};
export default config;
