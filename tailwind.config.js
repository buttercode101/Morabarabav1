/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Premium Font Families
      fontFamily: {
        'primary': ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'display': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      
      // Font Sizes with line-height and letter-spacing
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '-0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '-0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem', { lineHeight: '4rem', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem', { lineHeight: '5rem', letterSpacing: '-0.03em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },
      
      // Premium Color System - African-Inspired
      colors: {
        // Morabaraba Primary
        mora: {
          50: '#FFF0F5',
          100: '#FFE0E9',
          200: '#FFC0D4',
          300: '#FF85AB',
          400: '#FF6B9D',
          500: '#F27696',
          600: '#D6336C',
          700: '#C2255C',
          800: '#A81D4F',
          900: '#8B1540',
          950: '#6B0F30',
        },
        
        // African Earth Tones
        earth: {
          ochre: '#D4A056',
          terracotta: '#C15B3E',
          sand: '#D4B483',
          clay: '#A0522D',
          soil: '#6B4226',
          50: '#FDF8F6',
          100: '#F5EBE5',
          200: '#E8D5C5',
          300: '#D4B483',
          400: '#C1966A',
          500: '#A87850',
          600: '#8B5A3C',
          700: '#6B4226',
          800: '#4A2F1A',
          900: '#2A1A0A',
          950: '#1A0E05',
        },
        
        // Premium Accents
        premium: {
          gold: '#FFD700',
          goldLight: '#FFE44D',
          goldDark: '#DAA520',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
          diamond: '#B9F2FF',
        },
        
        // Diketo Primary
        diketo: {
          50: '#FEF9F3',
          100: '#FDF3E6',
          200: '#FAE7CD',
          300: '#F5D6B5',
          400: '#E8D5A0',
          500: '#D4B483',
          600: '#C1966A',
          700: '#A87850',
          800: '#8B5A3C',
          900: '#6B4226',
          950: '#3A2010',
        },
        
        // Semantic Colors
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
      },
      
      // Spacing System (8px grid)
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem',
      },
      
      // Premium Shadows
      boxShadow: {
        'premium': '0 1px 2px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.2), 0 24px 48px rgba(0, 0, 0, 0.25)',
        'premium-lg': '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.15), 0 16px 32px rgba(0, 0, 0, 0.2), 0 32px 64px rgba(0, 0, 0, 0.25)',
        'glow-gold': '0 4px 16px rgba(255, 215, 0, 0.3), 0 8px 32px rgba(255, 215, 0, 0.2), 0 16px 64px rgba(255, 215, 0, 0.15)',
        'glow-pink': '0 4px 16px rgba(242, 118, 150, 0.3), 0 8px 32px rgba(242, 118, 150, 0.2), 0 16px 64px rgba(242, 118, 150, 0.15)',
        'glow-green': '0 4px 16px rgba(76, 175, 80, 0.3), 0 8px 32px rgba(76, 175, 80, 0.2), 0 16px 64px rgba(76, 175, 80, 0.15)',
        'inner-glow': 'inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
        'button': '0 4px 14px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15)',
        'button-hover': '0 6px 20px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 0, 0, 0.2)',
        'button-active': '0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'modal': '0 24px 64px rgba(0, 0, 0, 0.5), 0 12px 32px rgba(0, 0, 0, 0.4)',
      },
      
      // Border Radius
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'full': '9999px',
      },
      
      // Animation Durations
      duration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
      },
      
      // Custom Animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shake': 'shake 0.3s ease-in-out',
        'spin-slow': 'spin-slow 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      
      // Backdrop Blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      
      // Touch Targets
      minWidth: {
        'touch': '56px',
      },
      minHeight: {
        'touch': '56px',
      },
    },
  },
  plugins: [],
}
