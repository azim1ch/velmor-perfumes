import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10100F", // базовый фон
        surface: "#1B1A18", // карточки
        raised: "#242220", // поля ввода, наведение
        line: "#33302C", // тонкие разделители
        cream: "#F4EEE4", // основной текст
        muted: "#B3AA9C", // второстепенный текст (контраст > 7:1 на ink)
        gold: "#C5A16B", // акцент
        "gold-soft": "#D9BD8F",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        logo: "0.38em",
      },
    },
  },
  plugins: [],
} satisfies Config;
