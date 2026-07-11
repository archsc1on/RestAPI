export const tokens = {
  color: {
    brand: {
      50: '#f0f4ff',
      100: '#dbe4ff',
      200: '#bac8ff',
      300: '#91a7ff',
      400: '#748ffc',
      500: '#5c7cfa',
      600: '#4c6ef5',
      700: '#4263eb',
      800: '#3b5bdb',
      900: '#364fc7',
      950: '#1e3a8a',
    },
    surface: {
      light: {
        0: '#ffffff',
        1: '#f8fafc',
        2: '#f1f5f9',
        3: '#e2e8f0',
      },
      dark: {
        0: '#0a0a0f',
        1: '#111118',
        2: '#1a1a24',
        3: '#232330',
      },
    },
  },
  typography: {
    fontDisplay: 'Inter, system-ui, -apple-system, sans-serif',
    fontMono: 'JetBrains Mono, Fira Code, ui-monospace, monospace',
  },
  spacing: {
    section: '6rem',
    component: '2rem',
    element: '1rem',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    pill: '9999px',
  },
  motion: {
    fast: 100,
    normal: 200,
    slow: 400,
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
    easeOut: [0.25, 0.46, 0.45, 0.94],
  },
} as const
