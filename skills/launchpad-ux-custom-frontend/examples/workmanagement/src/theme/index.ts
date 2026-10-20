import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    backgroundColor: string;
    card: { backgroundColor: string; borderLeft: string; borderLeftColor: string };
    modal: { backgroundColor: string; topColor: string };
    headerNav: { backgroundColor: string; navLinkColor: string; navLinkHoverColor: string; menuToggleColor: string };
    embedded: { resolutionTextColor: string };
    actionButtons: { primary: { backgroundColor: string; color: string }; secondary: { backgroundColor: string; color: string } };
  }
  interface ThemeOptions {
    backgroundColor?: string;
    card?: { backgroundColor: string; borderLeft: string; borderLeftColor: string };
    modal?: { backgroundColor: string; topColor: string };
    headerNav?: { backgroundColor: string; navLinkColor: string; navLinkHoverColor: string; menuToggleColor: string };
    embedded?: { resolutionTextColor: string };
    actionButtons?: { primary: { backgroundColor: string; color: string }; secondary: { backgroundColor: string; color: string } };
  }
}

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--app-primary-color': '#1976d2',
          '--app-primary-dark-color': '#115293',
          '--app-primary-light-color': '#4791db',
          '--app-secondary-color': '#dc004e',
          '--app-neutral-color': 'grey',
          '--app-neutral-light-color': 'lightgrey',
          '--app-neutral-dark-color': '#262626',
          '--app-error-color': '#f44336',
          '--app-error-light-color': '#e57373',
          '--app-error-dark-color': '#d32f2f',
          '--app-warning-color': '#ff9800',
          '--app-warning-color-light': '#ffb74d',
          '--app-warning-color-dark': '#f57c00',
          '--app-background-color': '#fafafa',
          '--app-form-bg-color': 'white',
          '--app-nav-bg': '#1976d2',
          '--app-nav-color': '#ffffff',
          '--modal-background-color': 'rgba(100, 100, 100, 0.4)',
          '--modal-top-color': 'white',
          '--modal-border-color': 'black',
          '--modal-box-shadow-color': '#777',
          '--utility-count-background-color': '#90caf9',
          '--utility-card-border-color': '#f5f5f5',
          '--link-button-color': '#1976d2',
          '--banner-text-color': 'rgb(0, 0, 0)',
          '--app-text-color': 'white',
          '--utility-background-color': 'white',
          '--table-header-background': '#f5f5f5',
          '--step-line-color': 'rgba(0, 0, 0, 0.12)',
          '--selected-step-label-color': 'rgba(0, 0, 0, 0.87)',
          '--step-label-color': 'rgba(0, 0, 0, 0.54)',
          '--svg-color': 'invert(0%)',
          '--secondary-button-text-color': '#ffffff',
          '--text-primary-color': '#000',
          '--text-secondary-color': '#757575',
          '--stepper-completed-bg-color': '#218721'
        }
      }
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: { root: { width: '100%' } }
    }
  },
  headerNav: {
    backgroundColor: '#ffffff',
    navLinkColor: 'rgba(0, 0, 0, 0.87)',
    navLinkHoverColor: '#1976d2',
    menuToggleColor: 'rgba(0, 0, 0, 0.87)'
  },
  actionButtons: {
    primary: { backgroundColor: '#1976d2', color: '#FFFFFF' },
    secondary: { backgroundColor: '#dc004e', color: '#FFFFFF' }
  },
  modal: { backgroundColor: 'rgba(100, 100, 100, 0.4)', topColor: 'white' },
  embedded: { resolutionTextColor: 'darkslategray' },
  backgroundColor: '#fff',
  card: { backgroundColor: '#fff', borderLeft: '6px solid', borderLeftColor: '#1976d2' },
  palette: {
    primary: { main: '#1976d2', light: '#4791db', dark: '#115293', contrastText: '#fff' },
    secondary: { main: '#dc004e', light: '#ff4081', dark: '#c51162', contrastText: '#fff' },
    background: { default: '#fafafa', paper: '#fff' }
  },
  typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }
});

export { theme };
