import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F4F7FF',
      dark: '#BFC8E0'
    },
    secondary: {
      main: '#5B5591',
    },
    background: {
      default: '#3F3B61',
      dark: '#29263F'
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  spacing: 8,
});

export default theme;