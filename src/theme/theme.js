import { createTheme } from '@mui/material/styles';

// Brand tokens lifted 1:1 from the original design system
export const colors = {
  azulOscuro: '#002532',
  grisAcero: '#aaaa9f',
  blanco: '#ffffff',
};

// Height of the fixed mobile header — shared with components (AvatarNarrator's
// compact sticky bar, StickyCta) that need to position themselves relative to it.
export const HEADER_HEIGHT_MOBILE = 60;

const theme = createTheme({
  breakpoints: {
    // 760px is the structural breakpoint in the original design: below it,
    // the avatar column collapses into a sticky top bar.
    values: { xs: 0, sm: 480, md: 760, lg: 1100, xl: 1440 },
  },
  palette: {
    mode: 'dark',
    background: {
      default: colors.azulOscuro,
      paper: colors.azulOscuro,
    },
    primary: {
      main: colors.blanco,
      contrastText: colors.azulOscuro,
    },
    text: {
      primary: colors.blanco,
      secondary: colors.grisAcero,
    },
  },
  typography: {
    fontFamily: 'var(--font-stack)',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontFamily: 'var(--font-stack)', fontWeight: 400 },
    h2: { fontFamily: 'var(--font-stack)', fontWeight: 400 },
    body1: { fontFamily: 'var(--font-stack)', fontWeight: 400 },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'var(--font-stack)',
        },
      },
    },
  },
});

// Separate light-mode theme for the internal /interno admin tool — the
// main theme above is dark-mode for the candidate-facing microsite
// (white text by default), which renders unreadable (near-invisible white
// text) on the admin tool's light background if reused as-is.
export const adminTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#f4f5f3', paper: '#ffffff' },
    primary: { main: colors.azulOscuro, contrastText: colors.blanco },
    text: { primary: '#16232a', secondary: 'rgba(22,35,42,0.62)' },
    success: { main: '#1e7e42' },
    warning: { main: '#a8631a' },
    divider: 'rgba(22,35,42,0.1)',
  },
  typography: {
    fontFamily: 'var(--font-stack)',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
  },
});

export default theme;
