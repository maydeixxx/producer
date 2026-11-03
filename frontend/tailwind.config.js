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
        // Figma Warm Chocolate & Graphite lighter palette
        surface: {
          0: '#7e6263',    // Main canvas: warm chocolate / cocoa (Figma RGB 126, 98, 99)
          50: '#524646',   // Sidebar: dark graphite-chocolate (Figma RGB 82, 70, 70)
          100: '#695152',  // Cards & Panels: rich chocolate
          200: '#574243',  // Inset fields & soft hover: warm cocoa
          300: '#463536'   // Active buttons & selected items
        },
        border: {
          subtle: '#614d4e', // Hairline borders
          hover: '#453536',  // Hover states
          strong: '#1f1818'  // Deep graphite divider line (matches Figma)
        },
        // Warm calibrated text ramp for high contrast against chocolate tones
        zinc: {
          100: '#ffffff',
          200: '#f8f4f2',
          300: '#ebdcd7',
          400: '#d9c6bf',
          500: '#bfaba4',
          600: '#99857e',
          700: '#6d5a55',
          800: '#4a3a36',
          900: '#302422',
          950: '#1e1615',
        },
        accent: {
          orange: '#ff9d42', // Warm caramel
          honey: '#fbbf24',  // Honey amber
          red: '#f87171',    // Coral deadline alert
          green: '#34d399',  // Sage green
          blue: '#60a5fa',   // Sky accent
          purple: '#c084fc', // Lilac
          yellow: '#fbbf24'  // Gold
        }
      }
    },
  },
  plugins: [],
}
