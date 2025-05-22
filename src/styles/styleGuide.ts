// SplitFair Style Guide
export const styleGuide = {
  // Colors
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
    },
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },

  // Typography
  typography: {
    h1: 'text-4xl md:text-5xl font-extrabold tracking-tight',
    h2: 'text-3xl font-bold tracking-tight',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',
    body: 'text-base text-gray-600',
    small: 'text-sm text-gray-500',
  },

  // Spacing
  spacing: {
    section: 'py-16',
    container: 'max-w-6xl mx-auto px-4',
  },

  // Components
  components: {
    // Cards
    card: {
      base: 'bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200',
      hover: 'hover:scale-[1.02]',
    },
    // Buttons
    button: {
      base: 'font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center',
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
      sizes: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      }
    },
    // Inputs
    input: {
      base: 'w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200',
      sizes: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-5 py-4 text-lg',
      }
    },
    // Labels
    label: 'block text-sm font-medium text-gray-700 mb-1',
  },

  // Animations
  animation: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
  }
};
