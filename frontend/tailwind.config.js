/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
        meme: ['"Oswald"', 'Impact', 'sans-serif']
      },
      colors: {
        surface: {
          0: '#121217',
          50: '#181820',
          100: '#1f1f29',
          200: '#272734',
          300: '#323242'
        },
        border: {
          subtle: '#2c2c3b',
          hover: '#3f3f52',
          strong: '#54546d'
        },
        accent: {
          orange: '#ff9f0a',
          red: '#ff453a',
          green: '#30d158',
          blue: '#0a84ff',
          purple: '#bf5af2',
          yellow: '#ffd60a'
        }
      }
    },
  },
  plugins: [],
}
