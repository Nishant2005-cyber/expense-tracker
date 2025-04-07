import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    dark: {
      main: string;
      secondary: string;
    };
    light: {
      main: string;
    };
    gray: {
      main: string;
    };
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    dark?: {
      main: string;
      secondary: string;
    };
    light?: {
      main: string;
    };
    gray?: {
      main: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4361ee',
      dark: '#3a56d4',
    },
    secondary: {
      main: '#3f37c9',
    },
    accent: {
      main: '#4cc9f0',
    },
    dark: {
      main: '#0F1035',
      secondary: '#16213e',
    },
    light: {
      main: '#E5E9F0',
    },
    gray: {
      main: '#6B7280',
    },
    success: {
      main: '#4ade80',
    },
    warning: {
      main: '#fbbf24',
    },
    error: {
      main: '#f87171',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
}); 