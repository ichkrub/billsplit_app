// SplitFair Style Guide
export const styleGuide = {
  // Colors
  colors: {
    primary: {
      50: '#E6F3FF',
      100: '#CCE7FF',
      200: '#99CEFF',
      300: '#66B5FF',
      400: '#339CFF',
      500: '#0077CC', // Main primary color
      600: '#005FA3',
      700: '#00477A',
      800: '#002F52',
      900: '#001829',
    },
    secondary: {
      50: '#F7FDF0',
      100: '#E7F9D3', // Main secondary color
      200: '#D5F4B6',
      300: '#C2EF99',
      400: '#B0EA7C',
      500: '#9DE55F',
      600: '#7EB74C',
      700: '#5E8939',
      800: '#3F5B26',
      900: '#1F2E13',
    },
    gray: {
      50: '#F8FAFC', // Main background color
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569', // Main text accent color
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },

  // Typography
  typography: {
    // Headers
    h1: {
      hero: 'text-[3.2rem] md:text-[4.4rem] font-bold tracking-tight leading-[105%] text-primary-900',
      page: 'text-[2.5rem] md:text-[3rem] font-bold tracking-tight text-gray-900 mb-4',
    },
    h2: 'text-[2rem] md:text-[2.5rem] font-bold tracking-tight text-gray-900 mb-4',
    h3: 'text-[1.5rem] md:text-[2rem] font-bold text-gray-800 mb-3',
    h4: 'text-[1.25rem] md:text-[1.5rem] font-semibold text-gray-800 mb-2',
    // Body text
    subtitle: {
      hero: 'text-[1.25rem] leading-[150%] text-gray-600/90 my-[10px] mx-auto mb-[30px]',
      section: 'text-[1.15rem] md:text-[1.25rem] text-gray-600/90 leading-[150%]',
    },
    body: {
      large: 'text-lg text-gray-600 leading-relaxed',
      base: 'text-base text-gray-600 leading-relaxed',
      small: 'text-sm text-gray-500',
    },
    // Interactive elements
    button: {
      large: 'text-xl font-bold tracking-tight',
      base: 'text-lg font-semibold tracking-tight',
      small: 'text-base font-medium',
    }
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
      base: 'font-bold rounded-[8px] transition-all duration-200 inline-flex items-center justify-center',
      primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:translate-y-[1px]',
      secondary: 'bg-white text-primary-700 border border-primary-200 hover:border-primary-300 hover:-translate-y-[1px] active:translate-y-[1px]',
      sizes: {
        sm: 'px-5 py-2.5 text-[14px]',
        md: 'px-6 py-3 text-[16px]',
        lg: 'px-8 py-4 text-[18px] min-w-[180px]',
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
