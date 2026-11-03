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
          0: '#000000',
          50: '#08080a',
          100: '#0f0f13',
          200: '#17171d',
          300: '#212129'
        },
        border: {
          subtle: '#1d1d24',
          hover: '#2a2a35',
          strong: '#3c3c4a'
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
