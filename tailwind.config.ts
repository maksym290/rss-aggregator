/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      colors: {
        surface: {
          0: '#ffffff',
          1: '#f8f8f7',
          2: '#f1f0ed',
          3: '#e8e7e3',
        },
        ink: {
          DEFAULT: '#1a1918',
          muted: '#6b6966',
          faint: '#9e9b97',
        },
        accent: {
          DEFAULT: '#2563eb',
          light: '#eff6ff',
          border: '#bfdbfe',
        }
      },
    },
  },
  plugins: [],
}
