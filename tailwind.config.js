/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  safelist: [
    "bg-blue-500",
    "border-blue-500",

    "bg-amber-500",
    "border-amber-500",

    "bg-green-500",
    "border-green-500",

    "bg-red-500",
    "border-red-500",
  ],
  theme: {
    extend: {
      colors: {
        /** ✅ Brand */
        primary: {
          DEFAULT: "#43ce4e",
          light: "#6ee57a",
          dark: "#2fa83a",
        },

        /** ✅ Backgrounds */
        background: {
          DEFAULT: "#ffffff",
          muted: "#f9fafb",
          subtle: "#f3f4f6",
        },

        /** ✅ Surfaces / cards */
        surface: {
          DEFAULT: "#ffffff",
          elevated: "#f1f5f9",
          border: "#e5e7eb",
        },

        /** ✅ Text */
        text: {
          primary: "#111827", // near-black
          secondary: "#6b7280", // gray-500
          tertiary: "#9ca3af", // gray-400
          inverse: "#ffffff",
        },

        /** ✅ Status / accents */
        accent: {
          success: "#43ce4e",
          error: "#ef4444",
          warning: "#f59e0b",
          info: "#0ea5e9",
        },
      },
    },
  },
  plugins: [],
};
