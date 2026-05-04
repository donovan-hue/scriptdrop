module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'metal-white': '#ffffff',
        'metal-silver': '#f0f4ff',
        'silver-light': '#f8f9fa',
        'tornasol-pink': '#ff6ec7',
        'tornasol-cyan': '#00d4ff',
        'tornasol-purple': '#b344ff',
        'tornasol-blue': '#5b8fff',
        'glass-white': 'rgba(255, 255, 255, 0.75)',
        'glass-silver': 'rgba(240, 244, 255, 0.6)',
      },
      backdropBlur: {
        'xl': '20px',
        '2xl': '25px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(179, 68, 255, 0.1)',
        'glass-hover': '0 12px 40px rgba(179, 68, 255, 0.2)',
        'iridescent': '0 0 20px rgba(255, 110, 199, 0.35), 0 0 30px rgba(0, 212, 255, 0.25), 0 0 40px rgba(179, 68, 255, 0.2)',
        'primary-glow': '0 8px 24px rgba(179, 68, 255, 0.35)',
      },
      backgroundImage: {
        'gradient-metal': 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
        'gradient-tornasol': 'linear-gradient(135deg, #ff6ec7 0%, #b344ff 50%, #00d4ff 100%)',
        'gradient-primary': 'linear-gradient(135deg, #b344ff 0%, #5b8fff 50%, #00d4ff 100%)',
        'gradient-soft-tornasol': 'linear-gradient(135deg, rgba(255, 110, 199, 0.3) 0%, rgba(179, 68, 255, 0.3) 50%, rgba(0, 212, 255, 0.3) 100%)',
      },
    },
  },
  plugins: [],
}
