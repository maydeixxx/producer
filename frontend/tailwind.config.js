/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        meme: ['"Oswald"', 'Impact', 'sans-serif']
      },
      colors: {
        // Notion Dark Clean Palette
        surface: {
          0: '#191919',    // Main Notion Canvas
          50: '#202020',   // Notion Sidebar
          100: '#252525',  // Notion Cards & Table Rows
          200: '#2e2e2e',  // Notion Inset & Hover
          300: '#383838'   // Notion Active
        },
        border: {
          subtle: '#2e2e2e', // Clean 1px border
          hover: '#3f3f3f',  // Hover states
          strong: '#262626'  // Dividers
        },
        // Notion Neutral Text Ramp
        zinc: {
          100: '#ffffff',
          200: '#f0f0f0',
          300: '#e6e6e6',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        accent: {
          orange: '#ea580c', // Notion Orange
          honey: '#f59e0b',  // Notion Amber
          red: '#ef4444',    // Notion Red
          green: '#10b981',  // Notion Green
          blue: '#3b82f6',   // Notion Blue
          purple: '#a855f7', // Notion Purple
          yellow: '#eab308'  // Notion Yellow
        }
      }
    },
  },
  plugins: [],
}
