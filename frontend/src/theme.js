import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563EB', // Enterprise Blue
        light: '#60A5FA',
        dark: '#1D4ED8',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#4F46E5', // Indigo
        light: '#818CF8',
        dark: '#3730A3',
      },
      info: {
        main: '#06B6D4', // Accent Cyan
      },
      success: {
        main: '#10B981', // emerald success
      },
      background: {
        default: mode === 'light' ? '#F8FAFC' : '#0F172A', // Slate 50 vs Slate 900
        paper: mode === 'light' ? '#FFFFFF' : '#1E293B',  // White vs Slate 800
      },
      text: {
        primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
        secondary: mode === 'light' ? '#475569' : '#94A3B8',
      },
      divider: mode === 'light' ? '#E2E8F0' : '#334155',
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-1.5px' },
      h2: { fontWeight: 800, letterSpacing: '-1px' },
      h3: { fontWeight: 700, letterSpacing: '-0.5px' },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: mode === 'light' 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)' 
              : '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
            border: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
            borderRadius: 16,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)',
            color: mode === 'light' ? '#0F172A' : '#F8FAFC',
            backdropFilter: 'blur(12px)',
            borderBottom: mode === 'light' ? '1px solid #E2E8F0' : '1px solid #334155',
            boxShadow: 'none',
          },
        },
      },
    },
  });
};
