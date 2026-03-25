# Authentication Flow

The SDK handles authentication through two React context providers working together.

## PegaAuthProvider — OAuth Login

`PegaAuthProvider` wraps the app and manages the OAuth flow:

1. Listens for the `SdkConstellationReady` DOM event (fired when the Constellation bootstrap shell finishes loading and auth succeeds)
2. Calls `loginIfNecessary()` from `@pega/auth/lib/sdk-auth-manager` to kick off the OAuth flow
3. Exposes `isAuthenticated` via context

```tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getSdkConfig, loginIfNecessary, sdkSetAuthHeader } from '@pega/auth/lib/sdk-auth-manager';

const AuthContext = createContext<{ isAuthenticated: boolean } | undefined>(undefined);

const PegaAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleReady = () => setIsAuthenticated(true);
    document.addEventListener('SdkConstellationReady', handleReady);

    initializeAuthentication()
      .then(() => {
        // mainRedirect: true is REQUIRED for Launchpad (Cognito blocks iframes)
        loginIfNecessary({ appName: 'embedded', mainRedirect: true });
      })
      .catch((error) => {
        console.error('Pega authentication failed:', error);
      });

    return () => document.removeEventListener('SdkConstellationReady', handleReady);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
```

> **Important:** `mainRedirect: true` is required for Launchpad because AWS Cognito (used for Launchpad authentication) sets `X-Frame-Options: deny`, which blocks iframe/popup-based login flows. With `mainRedirect: true`, the browser performs a full-page redirect to Cognito, and after login, returns to the main page with a `?code=` parameter that the SDK exchanges for tokens.

> **Important:** When `mainRedirect: true` is set, the `@pega/auth` library reads credentials from `portalClientId`/`portalClientSecret` rather than `mashupClientId`/`mashupClientSecret`. Both pairs must be configured in `sdk-config.json`.

The `initializeAuthentication()` function reads `sdk-config.json` via `getSdkConfig()` and configures auth headers for Basic, BasicTO, or custom bearer flows as needed. Always add `.catch()` error handling to surface auth failures in the console.

## PegaReadyProvider — PCore Lifecycle

Once authenticated, `PegaReadyProvider` bootstraps the Constellation engine:

1. Calls `PCore.onPCoreReady()` to register a callback
2. Initializes the SDK component map via `getSdkComponentMap(localSdkComponentMap)`
3. Calls `myLoadMashup('pega-root', false)` (for embedded) or `myLoadPortal(...)` (for portal mode)
4. Exposes `usePega()` hook with: `isPegaReady`, `createCase()`, `PegaContainer`

```tsx
import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import localSdkComponentMap from '../../../sdk-local-component-map';

declare const myLoadMashup: any;

// RootComponent connects PCore's store to React
function RootComponent(props: any) {
  const PegaConnectObj = createPConnectComponent();
  const contextValue = useMemo(() => ({ store: PCore.getStore(), displayOnlyFA: true }), []);
  return (
    <StoreContext.Provider value={contextValue}>
      <PegaConnectObj {...props} />
    </StoreContext.Provider>
  );
}

// Inside PegaReadyProvider:
const startMashup = async () => {
  PCore.onPCoreReady(async (renderObj) => {
    await getSdkComponentMap(localSdkComponentMap);
    const { props } = renderObj;
    setRootProps(props);
    setIsPegaReady(true);
  });
  myLoadMashup('pega-root', false);
};
```

## Creating Cases via PCore

The `usePega()` hook exposes a `createCase()` function that uses the `PCore.getMashupApi()`:

```tsx
const createCase = (mashupCaseType: string, options: CaseOptions) => {
  return PCore.getMashupApi()
    .createCase(mashupCaseType, PCore.getConstants().APP.APP, options);
};
```

This replaces the need for manual DX API `POST /cases` calls, ETag handling, and assignment action PATCH requests — the SDK manages all of that internally.
