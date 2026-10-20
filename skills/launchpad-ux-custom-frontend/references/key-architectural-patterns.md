# Key Architectural Patterns

## Embedded (Mashup) vs Portal Mode

| Mode | Auth Call | Bootstrap Call | Use Case |
| ---- | --------- | -------------- | -------- |
| **Embedded** | `loginIfNecessary({ appName: 'embedded', mainRedirect: true })` | `myLoadMashup('pega-root', false)` | Custom layout with Pega content areas embedded within your UI |
| **Portal** | `loginIfNecessary({ appName: 'portal', mainRedirect: true })` | `myLoadPortal('pega-root', portalName, [])` | Pega controls the full layout; you provide the MUI theme wrapper |

> **Note:** On Launchpad, `mainRedirect` must always be `true` because Cognito blocks iframe login. The `appName` parameter controls which client IDs and bootstrap behavior to use.

**Embedded mode** is the recommended approach for custom frontends. You control the page structure (header, sidebar, dashboard) and use `<PegaContainer />` to render Pega-managed content (case views, assignments) within your layout.

**Portal mode** lets Pega render the full portal layout (AppShell, navigation, work area). You only provide the theme wrapper. This is simpler but gives you less control.

## The SDK Component Map

The component map tells the Constellation engine which React component to render for each Pega DX component name:

```js
// sdk-local-component-map.js
import MyCustomView from './src/components/MyCustomView';

const localSdkComponentMap = {
  MyCustomView,   // Overrides the Pega-provided "MyCustomView" component
};

export default localSdkComponentMap;
```

Components not found in the local map fall back to `@pega/react-sdk-components`'s built-in implementations. This is how you inject custom React components (e.g., MUI-based) into the Pega rendering pipeline.

## MUI Theme + Pega CSS Variables

The SDK's built-in components read CSS custom properties for styling. Your MUI theme must set these in `MuiCssBaseline.styleOverrides`:

```ts
import { createTheme } from '@mui/material/styles';

// Module augmentation for custom theme properties (MUI v6+ uses @mui/material/styles)
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
          '--app-background-color': '#fafafa',
          '--app-form-bg-color': 'white',
          '--app-nav-bg': '#1976d2',
          '--app-nav-color': '#ffffff',
          // ... full set of CSS variables
        }
      }
    }
  },
  // Pega SDK expects these custom theme extensions (no 'as any' cast needed with proper augmentation):
  headerNav: { backgroundColor: '#ffffff', navLinkColor: 'rgba(0,0,0,0.87)' },
  actionButtons: { primary: { backgroundColor: '#1976d2', color: '#fff' } },
  modal: { backgroundColor: 'rgba(100,100,100,0.4)', topColor: 'white' },
  embedded: { resolutionTextColor: 'darkslategray' },
  backgroundColor: '#fff',
  card: { backgroundColor: '#fff', borderLeft: '6px solid', borderLeftColor: '#1976d2' },
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});
```
