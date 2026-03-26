---
name: launchpad-ux-custom-frontend
description: "Guide for building custom React front-ends on Pega Launchpad using the Pega React SDK (@pega/react-sdk-components). Use this skill whenever users ask about building complete custom front-ends over a Launchpad application. Do not use this skill for questions about DX API methods unless they specifically relate to building a custom front-end. Do not use this skill for questions about custom UX components or the pega-embed web component."
tags: [react, frontend, react-sdk, pega-launchpad, constellation, material-ui, webpack, oauth, pcore]
---

# Building a React Front-End for Pega Launchpad with the Pega React SDK

A practical guide for building custom React UIs on top of Pega Launchpad using the **Pega React SDK** (`@pega/react-sdk-components`). This approach uses the SDK's Constellation engine to handle rendering, data binding, case management, and API communication — rather than making direct DX API calls.

Before proceeding, validate that building a custom front-end is necessary. Launchpad's out-of-the-box Constellation components and templates may meet requirements without this complexity.

When implementing a front-end, proceed incrementally. Always ask what folder to create the project in, don't assume or guess the location. 

Ask for validation and questions at each step to ensure that the user understands what was built and why, and to confirm that it meets their needs before moving on to the next step.

---

## 0. When to Build a Custom Frontend

Prefer **out-of-the-box Constellation components and templates** whenever they meet the business and UX requirements.

Consider a custom frontend only when:

- The business needs **visualizations or interaction patterns** not available out of the box
- You must use a specific design system (e.g., Material UI, shadcn/ui) or have strict branding requirements that cannot be met with Constellation's theming
- You need **full control over the page layout** while still leveraging Pega's case management, assignments, and data views through the SDK

Before deciding, validate that:

- The required behavior cannot be modeled with standard Constellation views, region templates, and OOTB components
- The long-term **maintenance cost** (SDK upgrades, security patches, library updates) is acceptable

---

## 1. Architecture Overview

The Pega React SDK approach works fundamentally differently from direct DX API calls. Instead of making raw HTTP requests to REST endpoints, you bootstrap the **Constellation engine** (`@pega/constellationjs`) which provides a global `PCore` object. The SDK's React components and bridge layer (`@pega/react-sdk-components`) render Pega-authored views automatically and expose hooks for creating cases and interacting with assignments.

```
Browser → React App → PCore (Constellation Engine) → Pega Launchpad Server
```

### Key Packages

| Package | Purpose |
| ------- | ------- |
| `@pega/react-sdk-components` | React bridge for Constellation — renders DX components, provides `PCore` lifecycle hooks, component mapping |
| `@pega/constellationjs` | Constellation bootstrap shell — loads `PCore` into the browser, manages the server connection |
| `@pega/auth` | OAuth 2.0 authentication — `loginIfNecessary()`, token management, handles the redirect flow |

### Key Files in a Custom Frontend Project

| File | Purpose |
| ---- | ------- |
| `sdk-config.json` | Central configuration: server URL, OAuth client IDs, app alias, portal name |
| `sdk-local-component-map.js` | Maps custom component names to your React implementations (overrides Pega defaults) |
| `src/context/PegaAuthProvider.tsx` | React context that wraps `@pega/auth`'s `loginIfNecessary()` and listens for `SdkConstellationReady` |
| `src/context/PegaReadyContext.tsx` | React context that manages `PCore.onPCoreReady()`, initializes the SDK component map, and exposes `usePega()` |
| `src/theme/index.ts` | MUI theme with CSS variable overrides that the SDK's Constellation components read |
| `webpack.config.js` | Webpack build config that copies Constellation bootstrap assets from `node_modules` into `dist/` |

---

## 2. Information You'll Need from the developer

before starting, gather this info from the developer and use it when generating the application:

1. What UI framework do they want to use with the React SDK? The example uses Material UI, but the SDK is compatible with any React component library. The choice of UI framework will influence the structure of the React components and the theming approach.
2. What are the brand colors they want to use?
3. What folder do they want to generate the application into? The example uses `examples/workmanagement`, but it can be generated anywhere in the file system.

## 3. Information You'll Need from Pega Launchpad

Before starting, gather these from the Launchpad application owner:

| Item | Example | Where to Find It |
| ---- | ------- | ----------------- |
| **Server URL** | `https://myapp-xyz-prod.pegalaunchpad.com` | Launchpad environment settings |
| **Authorize URL** | `https://your-cluster.cluster.lp.pegaservice.net/uas/oauth/authorize` | Launchpad cluster — **different domain** from the server URL |
| **Token URL** | `https://myapp-xyz-prod.pegalaunchpad.com/dx/uas/oauth/token` | Uses the app server URL |
| **Revoke URL** | `https://myapp-xyz-prod.pegalaunchpad.com/dx/uas/oauth/revoke` | Uses the app server URL |
| **OAuth Client ID** | `DUxcGyIt9QQjJBbk` | OAuth 2.0 Client Registration — used for both `portalClientId` and `mashupClientId` |
| **OAuth Client Secret** | (stored securely) | Same registration — required for **Confidential** client type |
| **App Alias** | `WorkManagement` | Application settings in Pega |
| **Portal Name** | (optional) | Specific portal to load; blank uses operator's default |
| **Case Type** | `WorkOrder` | Short case type name (not full class path in Launchpad) |

### Important: Launchpad vs Infinity Differences

- **API Base Path**: Launchpad uses `/dx/...` paths (not `/prweb/...` as in Infinity). The `infinityRestServerUrl` in `sdk-config.json` should point to the Launchpad server's base URL.
- **Case Type IDs**: Use the short case type name (e.g., `WorkOrder`), not the full Pega class path. Launchpad resolves it via the app alias.
- **OAuth URLs**: On Launchpad, the OAuth authorize endpoint may live on a **different domain** (the cluster frontend URL), while the token endpoint uses the application server URL.

---

## 4. SDK Configuration: `sdk-config.json`

This is the central configuration file that the SDK reads at runtime. It is copied to the `dist/` output by webpack.

### Critical: `serverType` must be `"launchpad"`

The `@pega/auth` library defaults `serverType` to `"infinity"`, which uses Infinity-specific OAuth endpoints and auth service logic. For Launchpad, you **must** set `serverType: "launchpad"` in `serverConfig`. Without this, the Constellation bootstrap won't set `envType: 'LAUNCHPAD'` and auth service configuration will be wrong.

### Critical: Dev Server Proxy for CORS

Launchpad's DX API endpoints do not include CORS headers for `localhost` origins. During development, **all `/dx/` requests must be proxied** through the webpack dev server (see Section 7). This means `token`, `revoke`, and `infinityRestServerUrl` should point to `localhost` in `sdk-config.json` during development.

### Critical: `mainRedirect: true` and Cognito

Launchpad uses AWS Cognito for authentication. Cognito sets `X-Frame-Options: deny`, which prevents iframe-based login. You **must** use `mainRedirect: true` in the `loginIfNecessary()` call, which performs a full-page redirect to Cognito instead of trying an iframe/popup.

When `mainRedirect: true` is set, the `@pega/auth` library reads `portalClientId` (not `mashupClientId`). You must set **both** `portalClientId` and `mashupClientId` in the config — they can be the same value.

### Critical: `redirectUri` must point to the main page

With `mainRedirect: true`, the `redirectUri` must be set to the main app URL (e.g., `http://localhost:3502/`), **not** `auth.html`. After OAuth login, the browser returns to the main page with a `?code=` parameter, and `loginIfNecessary()` detects this, exchanges the code for tokens, and then strips the query parameters.

The `auth.html` page is only used for popup/iframe callback flows (which don't work with Cognito).

```json
{
  "comment": "SDK configuration for your Pega Launchpad React application",
  "theme": "light",
  "authConfig": {
    "authService": "pega",
    "authorize": "https://your-cluster-frontend.cluster.lp.pegaservice.net/uas/oauth/authorize",
    "token": "http://localhost:3502/dx/uas/oauth/token",
    "revoke": "http://localhost:3502/dx/uas/oauth/revoke",
    "mashupClientId": "YOUR_CLIENT_ID",
    "mashupClientSecret": "YOUR_CLIENT_SECRET",
    "portalClientId": "YOUR_CLIENT_ID",
    "portalClientSecret": "YOUR_CLIENT_SECRET",
    "mashupGrantType": "authCode",
    "redirectUri": "http://localhost:3502/"
  },
  "serverConfig": {
    "serverType": "launchpad",
    "infinityRestServerUrl": "http://localhost:3502",
    "appAlias": "WorkManagement",
    "sdkContentServerUrl": "",
    "appPortal": "",
    "appMashupCaseType": "WorkOrder"
  }
}
```

> **Note:** The `token`, `revoke`, and `infinityRestServerUrl` values above use `localhost` because they are proxied through the webpack dev server (see Section 7). For production deployments, these should point directly to the Launchpad server.

| Field | Notes |
| ----- | ----- |
| `serverType` | **Must be `"launchpad"`** — defaults to `"infinity"` which breaks Launchpad auth |
| `infinityRestServerUrl` | Base URL — use `http://localhost:<port>` for dev (proxied), production Launchpad URL for prod |
| `authorize` | Full path to the OAuth 2.0 authorization endpoint. This is the **cluster frontend URL** (e.g., `https://your-cluster.cluster.lp.pegaservice.net/uas/oauth/authorize`), **not** the app server URL. This must **not** be proxied — it's a browser redirect |
| `token` | OAuth 2.0 token endpoint. Points to localhost in dev (proxied to `https://your-app.pegalaunchpad.com/dx/uas/oauth/token`) |
| `revoke` | OAuth 2.0 revocation endpoint. Same proxy pattern as `token` |
| `mashupClientId` / `portalClientId` | OAuth client IDs — **both must be set** (can be the same value). The library reads `portalClientId` when `mainRedirect: true` |
| `mashupClientSecret` / `portalClientSecret` | Client secrets — required for **Confidential** client type. Both must be set |
| `mashupGrantType` | Must be `"authCode"` for the OAuth authorization code flow |
| `redirectUri` | Must be the main page URL (e.g., `http://localhost:3502/`), **not** `auth.html` |
| `appMashupCaseType` | Short case type name (e.g., `WorkOrder`), not the full Pega class path |
| `appPortal` | Leave blank to use the operator's default portal |
| `theme` | `"light"`, `"dark"`, or a custom theme key — controls which MUI theme is selected |

---

## 5. Pega Launchpad Configuration Prerequisites

### CORS Policy (Production Only)

For **production deployments** where the browser makes requests directly to the Launchpad server, your Launchpad application must have a **CORS policy** that includes your web app's origin.

For **local development**, CORS is bypassed entirely by the webpack dev server proxy (see Section 7), so no CORS configuration is needed in Launchpad during development.

For production:

1. Create a new CORS Policy rule in Launchpad. Set availability to **public overridable**.
2. Leave the origins list blank initially, save the rule.
3. Update the App Settings rule — add your CORS policy as the default CORS policy.
4. Create a Configuration Set rule and include your CORS policy.
5. Commit and merge to main, publish the application.
6. Update a subscriber with the latest version.
7. In the subscriber configuration portal, override the CORS policy and add your production app's origin (e.g., `https://your-app.example.com`).

### OAuth Client Registration (Subscriber System)

In your Launchpad subscriber system, set up an OAuth 2.0 client registration:

1. Register a client. The client ID and secret are used for both `mashupClientId`/`portalClientId` and `mashupClientSecret`/`portalClientSecret` in `sdk-config.json`.
2. **Add the redirect URI** — for development this is `http://localhost:3502/` (the main app URL, not `auth.html`). For production, use your production URL.
3. The client can be **Confidential** (requires a client secret) or **Public** (no secret needed).

This gives you the client IDs needed for `sdk-config.json`.

---

## 6. Authentication Flow

> Read [references/authentication-flow.md](references/authentication-flow.md) for full code examples of PegaAuthProvider, PegaReadyProvider, and case creation via PCore.

Key points:
- Two React context providers work together: **PegaAuthProvider** (OAuth login) → **PegaReadyProvider** (PCore lifecycle).
- `PegaAuthProvider` listens for the `SdkConstellationReady` DOM event and calls `loginIfNecessary({ appName: 'embedded', mainRedirect: true })`.
- `mainRedirect: true` is **required** for Launchpad — Cognito blocks iframes. When set, `@pega/auth` reads `portalClientId` (not `mashupClientId`).
- `PegaReadyProvider` registers `PCore.onPCoreReady()` **before** calling `myLoadMashup()`, initializes the SDK component map, and exposes `usePega()` hook.
- Case creation: `PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options)` — replaces manual DX API POST/PATCH calls.
- Always add `.catch()` error handling to `loginIfNecessary()` to surface auth failures.

---

## 7. Key Architectural Patterns

> Read [references/key-architectural-patterns.md](references/key-architectural-patterns.md) for embedded vs portal mode, the SDK component map, and MUI theme + Pega CSS variable integration.

Key points:
- **Embedded mode** (recommended): You control the layout, use `<PegaContainer />` for Pega content. Use `myLoadMashup('pega-root', false)`.
- **Portal mode**: Pega controls the full layout. Use `myLoadPortal('pega-root', portalName, [])`.
- On Launchpad, `mainRedirect` must always be `true` (Cognito blocks iframes).
- Custom components override Pega defaults via `sdk-local-component-map.js`.
- MUI themes must set Pega CSS variables in `MuiCssBaseline.styleOverrides` and declare module augmentation for `@mui/material/styles`.

---

## 8. Webpack Configuration — Critical Details

> Read [references/webpack-configuration.md](references/webpack-configuration.md) for full CopyWebpackPlugin patterns, module rules, dev server proxy config, and HMR setup.

Key points:
- `CopyWebpackPlugin` must copy Constellation bootstrap shell, auth redirect pages, `sdk-config.json`, and `sdk-local-component-map.js` to `dist/`.
- CSS rule must include both `@pega/react-sdk-components/lib` and `react-datepicker/dist`.
- Dev server must proxy all `/dx/` requests to the Launchpad server (`changeOrigin: true`).
- `token`, `revoke`, and `infinityRestServerUrl` point to `localhost` in dev (proxied); real server URLs in production.
- Add `webpack.HotModuleReplacementPlugin()` for development mode if HMR is disabled.

---

## 9. Project Structure

```
my-pega-app/
├── assets/
│   ├── css/appStyles.css              # Global styles
│   └── img/                           # Static images
├── keys/                              # SSL certs for HTTPS dev (optional)
├── src/
│   ├── components/
│   │   ├── AppShell/index.tsx         # Top-level shell wrapping auth + SDK providers
│   │   ├── Header/index.tsx           # MUI AppBar with app name and logout
│   │   └── Dashboard/index.tsx        # Main view with case creation and PegaContainer
│   ├── context/
│   │   ├── PegaAuthProvider.tsx       # OAuth context, SdkConstellationReady listener
│   │   └── PegaReadyContext.tsx       # PCore lifecycle, usePega() hook, createCase()
│   ├── theme/
│   │   └── index.ts                   # MUI theme with Pega CSS variable overrides
│   ├── index.html                     # HTML template (webpack injects JS bundle)
│   └── index.tsx                      # React entry point — renders <AppShell />
├── sdk-config.json                    # Pega server URL, OAuth client IDs, app alias
├── sdk-local-component-map.js         # Custom component overrides (local → Pega fallback)
├── package.json
├── tsconfig.json
└── webpack.config.js                  # Build config with CopyWebpackPlugin for Constellation assets
```

---

## 10. Common Errors & Troubleshooting

| Error | Cause | Fix |
| ----- | ----- | --- |
| `PCore is not defined` | Constellation bootstrap shell not loaded | Verify `CopyWebpackPlugin` copies `@pega/constellationjs/dist/bootstrap-shell.js` to `dist/constellation/` |
| `SdkConstellationReady` never fires | Auth failed or `sdk-config.json` misconfigured | Check `serverType: "launchpad"`, client IDs, and browser console for 401/CORS errors |
| CORS errors on token endpoint | `token`/`revoke` URLs pointing directly to Launchpad server from localhost | Set up the webpack dev server proxy for `/dx` and point `token`/`revoke`/`infinityRestServerUrl` to `localhost` in `sdk-config.json` |
| CORS errors on DX API calls | `infinityRestServerUrl` pointing directly to Launchpad | Point `infinityRestServerUrl` to `http://localhost:<port>` and proxy all `/dx/` through webpack |
| `X-Frame-Options: deny` / Cognito login blocked | Using `mainRedirect: false` which tries iframe auth | Use `mainRedirect: true` — Cognito does not allow iframe embedding |
| Blank page after OAuth login redirect | `redirectUri` set to `auth.html` instead of main page | Set `redirectUri` to `http://localhost:3502/` (the main page), not `auth.html` |
| Token exchange fails silently | `portalClientId` not set in `sdk-config.json` | When `mainRedirect: true`, the auth library reads `portalClientId` — set both `mashupClientId` and `portalClientId` |
| `serverType` not set | Auth library defaults to `"infinity"` mode | Add `"serverType": "launchpad"` to `serverConfig` in `sdk-config.json` |
| `Module parse failed: Unexpected character '@'` on CSS | CSS from `react-datepicker` not handled by loader | Add `path.resolve(__dirname, 'node_modules/react-datepicker/dist')` to CSS rule `include` array |
| `Invalid module name in augmentation '@mui/styles/defaultTheme'` | MUI v6 uses `@mui/material/styles` for module augmentation | Change `declare module` to `'@mui/material/styles'` and augment both `Theme` and `ThemeOptions` |
| `401 Unauthorized` | Expired or invalid OAuth token | Re-authenticate; check that client IDs match the Launchpad subscriber's OAuth registration |
| `getSdkComponentMap` fails | `sdk-local-component-map.js` not found | Verify `CopyWebpackPlugin` copies it to the dist root; check the import path in `PegaReadyContext` |
| `myLoadMashup is not defined` | Bootstrap shell didn't execute | The Constellation bootstrap shell declares `myLoadMashup` globally; ensure `bootstrap-shell.js` is loaded before your app bundle |
| Blank screen after login | `PCore.onPCoreReady` callback not registered before `myLoadMashup` | Always call `PCore.onPCoreReady(...)` **before** `myLoadMashup(...)` |
| Case type not found | Using full Pega class path instead of short name | On Launchpad, use the short case type name (e.g., `WorkOrder`) |
| `[HMR] Hot Module Replacement is disabled` | Missing HMR plugin in webpack config | Add `new webpack.HotModuleReplacementPlugin()` to plugins array for development mode |

---

## 11. Examples

### Complete Working Example

A complete working example is available in the `examples/workmanagement` folder. This example demonstrates:

- Full project scaffold with webpack, TypeScript, and Material UI
- OAuth 2.0 authentication via `@pega/auth` with `PegaAuthProvider`
- PCore lifecycle management via `PegaReadyProvider` and `usePega()` hook
- Creating cases through `PCore.getMashupApi().createCase()`
- Rendering Pega content via `<PegaContainer />` inside a custom MUI layout
- Custom component overrides in `sdk-local-component-map.js`
- MUI theme with full Pega CSS variable integration

Use this as a starting point or reference.

---

## 12. Quick Start Checklist

- [ ] Gather server URL, authorize URL (cluster frontend), OAuth client ID + secret, app alias, case type name from Pega Launchpad
- [ ] Register the redirect URI (`http://localhost:3502/`) in your Launchpad OAuth client
- [ ] Set up `sdk-config.json` with:
  - `serverType: "launchpad"` in `serverConfig`
  - `mashupGrantType: "authCode"` in `authConfig`
  - Both `mashupClientId`/`portalClientId` and secrets set (can be the same value)
  - `redirectUri` set to `http://localhost:3502/` (main app URL, **not** `auth.html`)
  - `token`, `revoke`, and `infinityRestServerUrl` pointing to `localhost` (for dev proxy)
  - `authorize` pointing to the real cluster frontend URL (this is a browser redirect, not proxied)
- [ ] Configure webpack dev server proxy: context `['/dx']`, target pointing to your Launchpad server, `changeOrigin: true`
- [ ] Run `npm install` — this pulls `@pega/react-sdk-components`, `@pega/constellationjs`, `@pega/auth`, and MUI
- [ ] Verify webpack `CopyWebpackPlugin` copies Constellation assets, `sdk-config.json`, and `auth.html`
- [ ] Verify webpack CSS rule includes both `@pega/react-sdk-components/lib` and `react-datepicker/dist`
- [ ] Wrap your app in `<PegaAuthProvider>` → `<PegaReadyProvider>` → your components
- [ ] Use `loginIfNecessary({ appName: 'embedded', mainRedirect: true })` with `.catch()` error handling
- [ ] Use `usePega()` hook to access `isPegaReady`, `createCase()`, and `<PegaContainer />`
- [ ] Start with `npm start` — dev server runs on `http://localhost:3502`
- [ ] Browser will redirect to Cognito login → after login, returns to app with `?code=` → SDK exchanges for tokens
- [ ] For production: set up CORS on Launchpad and update `sdk-config.json` URLs to point to real server

---

## 13. SDK Approach vs Direct DX API Approach

| Concern | SDK Approach (this skill) | Direct DX API Approach |
| ------- | ------------------------- | ---------------------- |
| **API Calls** | Handled internally by PCore/Constellation | Manual `fetch()` to `/dx/api/application/v2/...` |
| **Case Creation** | `PCore.getMashupApi().createCase(...)` | `POST /cases?viewType=page` with manual JSON body |
| **Assignment Actions** | SDK manages ETags, PATCH calls, and outcomes | Manual PATCH with `If-Match` header, outcome in query string |
| **Data Views** | PCore data page utilities | Manual `POST /data_views/{id}` |
| **Rendering** | Constellation renders Pega-authored views automatically | You build every view from scratch |
| **Component Overrides** | `sdk-local-component-map.js` — swap individual components | N/A — you own all rendering |
| **Auth** | `loginIfNecessary()` + `SdkConstellationReady` event | Manual `PegaAuth` class with token storage |
| **Complexity** | Lower for standard workflows; higher initial setup | Higher ongoing; lower initial conceptual overhead |
| **Flexibility** | Moderate — you control layout, SDK controls Pega views | Full — you control everything |

Choose the **SDK approach** when you want to leverage Pega's rendering pipeline and component library while customizing the surrounding UI shell. Choose the **direct DX API approach** when you need complete control over every pixel and don't want any SDK rendering dependencies.