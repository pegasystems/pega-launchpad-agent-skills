import { createContext, useContext, useEffect, useState } from 'react';
import {
  getSdkConfig,
  loginIfNecessary,
  sdkSetAuthHeader,
  sdkSetCustomTokenParamsCB
} from '@pega/auth/lib/sdk-auth-manager';

interface AuthContextType {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PegaAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const handleReady = () => setIsAuthenticated(true);
    document.addEventListener('SdkConstellationReady', handleReady);

    initializeAuthentication()
      .then(() => {
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

export default PegaAuthProvider;

export const usePegaAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('usePegaAuth must be used within a PegaAuthProvider');
  }
  return context;
};

async function initializeAuthentication() {
  const { authConfig } = await getSdkConfig();

  if (
    (authConfig.mashupGrantType === 'none' || !authConfig.mashupClientId) &&
    authConfig.customAuthType === 'Basic'
  ) {
    const sB64 = window.btoa(
      `${authConfig.mashupUserIdentifier}:${window.atob(authConfig.mashupPassword)}`
    );
    sdkSetAuthHeader(`Basic ${sB64}`);
  }

  if (
    (authConfig.mashupGrantType === 'none' || !authConfig.mashupClientId) &&
    authConfig.customAuthType === 'BasicTO'
  ) {
    const now = new Date();
    const expTime = new Date(now.getTime() + 5 * 60 * 1000);
    let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
    sISOTime = sISOTime.replace(/[-:]/g, '');
    const sB64 = window.btoa(
      `${authConfig.mashupUserIdentifier}:${window.atob(authConfig.mashupPassword)}:${sISOTime}`
    );
    sdkSetAuthHeader(`Basic ${sB64}`);
  }

  if (
    authConfig.mashupGrantType === 'customBearer' &&
    authConfig.customAuthType === 'CustomIdentifier'
  ) {
    sdkSetCustomTokenParamsCB(() => {
      return { userIdentifier: authConfig.mashupUserIdentifier };
    });
  }
}
