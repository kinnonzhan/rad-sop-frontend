/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00A95F',
          80: 'rgba(0,169,95,0.8)',
          60: 'rgba(0,169,95,0.6)',
          40: 'rgba(0,169,95,0.4)',
          20: 'rgba(0,169,95,0.2)',
          10: 'rgba(0,169,95,0.1)',
        },
      },
      fontFamily: {
        sans: [
          'HarmonyOS Sans SC',
          '"PingFang SC"',
          '"Noto Sans SC"',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '28px',
        control: '8px',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
