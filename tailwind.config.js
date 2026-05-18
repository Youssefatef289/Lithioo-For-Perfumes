/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  safelist: [
    'stagger-1',
    'stagger-2',
    'stagger-3',
    'stagger-4',
    'stagger-5',
    'stagger-6',
    'stagger-7',
    'stagger-8',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7fb069',
          dark: '#6a9a5a',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#4F8F7B',
          dark: '#3d7262',
        },
        ink: '#2d2d2d',
        surface: {
          muted: '#f8faf8',
          cream: '#faf9f6',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 80% 20%, rgba(127,176,105,0.12) 0px, transparent 50%), radial-gradient(at 10% 80%, rgba(79,143,123,0.08) 0px, transparent 45%), radial-gradient(at 50% 50%, rgba(250,249,246,0.9) 0px, transparent 70%)',
        'mesh-dark':
          'radial-gradient(at 80% 20%, rgba(127,176,105,0.08) 0px, transparent 50%), radial-gradient(at 15% 70%, rgba(79,143,123,0.06) 0px, transparent 40%), radial-gradient(at 50% 100%, rgba(10,10,10,1) 0px, transparent 55%)',
        'hero-glow':
          'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(127,176,105,0.15), transparent 70%)',
      },
      maxWidth: {
        content: '1200px',
        wide: '1400px',
      },
      fontFamily: {
        sans: ['"Josefin Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        'cart-bounce': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'check-mark': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'heart-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1.15)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'soft-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        wave: {
          '0%': { boxShadow: '0 0 0px 0px rgba(127, 176, 105, 0.45)' },
          '100%': { boxShadow: '0 0 0px 12px rgba(127, 176, 105, 0)' },
        },
        'modal-in': {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, -12px) scale(0.9)' },
          '15%': { opacity: '1', transform: 'translate(-50%, 0) scale(1)' },
          '85%': { opacity: '1', transform: 'translate(-50%, 0) scale(1)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -8px) scale(0.95)' },
        },
        'card-btn-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'catalog-fade': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'review-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fab-pop': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.5)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fab-ring': {
          '0%': { boxShadow: '0 4px 20px rgba(127, 176, 105, 0.4), 0 0 0 0 rgba(127, 176, 105, 0.45)' },
          '70%': { boxShadow: '0 4px 20px rgba(127, 176, 105, 0.25), 0 0 0 16px rgba(127, 176, 105, 0)' },
          '100%': { boxShadow: '0 4px 20px rgba(127, 176, 105, 0.4), 0 0 0 0 rgba(127, 176, 105, 0)' },
        },
        'fab-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'hero-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'hero-ken-burns': {
          '0%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'cart-bounce': 'cart-bounce 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'check-mark': 'check-mark 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'heart-pulse': 'heart-pulse 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        float: 'float 4s ease-in-out infinite',
        'soft-pulse': 'soft-pulse 3s ease-in-out infinite',
        wave: 'wave 1s linear infinite',
        'modal-in': 'modal-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'toast-in': 'toast-in 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'card-btn-in': 'card-btn-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'catalog-fade': 'catalog-fade 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'review-marquee': 'review-marquee 45s linear infinite',
        'fab-pop': 'fab-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fab-ring': 'fab-ring 2s ease-out infinite',
        'fab-float': 'fab-float 3s ease-in-out infinite',
        'hero-fade-up': 'hero-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'hero-ken-burns': 'hero-ken-burns 6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
