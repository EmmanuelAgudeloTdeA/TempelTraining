/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tempel-bg': '#0D0F12',
        'tempel-card': '#1C2126',
        'tempel-border': '#2A2F36',
        'tempel-blue': '#29B6F6',
        'tempel-text': '#E5E7EB',
        'tempel-muted': '#9CA3AF',
        'estado-verde': '#22C55E',
        'estado-amarillo': '#EAB308',
        'estado-naranja': '#F97316',
        'estado-rojo': '#EF4444'
      },
      boxShadow: {
        glow: '0 0 15px rgba(41, 182, 246, 0.5)'
      }
    }
  },
  plugins: []
};

