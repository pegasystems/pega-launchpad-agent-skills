import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import type { CaseOptions } from '@pega/pcore-pconnect-typedefs/mashup/types';

import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';

import localSdkComponentMap from '../../sdk-local-component-map';
import { usePegaAuth } from './PegaAuthProvider';

declare const myLoadMashup: any;

function RootComponent(props: any) {
  const PegaConnectObj = createPConnectComponent();
  const thePConnObj = <PegaConnectObj {...props} />;

  const contextValue = useMemo(() => {
    return { store: PCore.getStore(), displayOnlyFA: true };
  }, []);

  return (
    <StoreContext.Provider value={contextValue}>
      {thePConnObj}
    </StoreContext.Provider>
  );
}

interface PegaContextProps {
  isPegaReady: boolean;
  rootPConnect?: typeof PConnect;
  createCase: (mashupCaseType: string, options: CaseOptions) => Promise<void>;
  PegaContainer: React.FC;
}

const PegaContext = createContext<PegaContextProps | undefined>(undefined);

interface PegaReadyProviderProps {
  theme: any;
}

export const PegaReadyProvider: React.FC<React.PropsWithChildren<PegaReadyProviderProps>> = ({
  children,
  theme
}) => {
  const { isAuthenticated } = usePegaAuth();
  const [isPegaReady, setIsPegaReady] = useState(false);
  const [rootProps, setRootProps] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const startMashup = async () => {
    try {
      PCore.onPCoreReady(async (renderObj: any) => {
        console.log('PCore ready!');
        await getSdkComponentMap(localSdkComponentMap);
        console.log('SdkComponentMap initialized');

        const { props } = renderObj;
        setRootProps(props);
        setIsPegaReady(true);
      });

      myLoadMashup('pega-root', false);
    } catch (error) {
      console.error('Error loading pega:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      startMashup();
    }
  }, [isAuthenticated]);

  const rootPConnect = useMemo(() => {
    if (rootProps?.getPConnect) {
      return rootProps.getPConnect();
    }
    return undefined;
  }, [rootProps]);

  const createCase = (mashupCaseType: string, options: CaseOptions) => {
    if (!isPegaReady) {
      return Promise.reject(new Error('Pega is not ready'));
    }

    setLoading(true);
    return new Promise<void>((resolve, reject) => {
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo()?.environmentInfoObject?.pyCaseTypeList;
        if (caseTypes && caseTypes.length > 0) {
          mashupCaseType = caseTypes[0].pyWorkTypeImplementationClassName;
        }
      }

      PCore.getMashupApi()
        .createCase(mashupCaseType, PCore.getConstants().APP.APP, options)
        .then(() => resolve())
        .catch((error: any) => {
          console.error('Error creating case:', error);
          reject(error);
        })
        .finally(() => setLoading(false));
    });
  };

  const PegaContainer = () => {
    if (loading) return <div style={{ textAlign: 'center' }}>Loading...</div>;
    return isPegaReady ? <RootComponent {...rootProps} /> : null;
  };

  return (
    <PegaContext.Provider value={{ isPegaReady, rootPConnect, createCase, PegaContainer }}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </PegaContext.Provider>
  );
};

export const usePega = () => {
  const context = useContext(PegaContext);
  if (!context) {
    throw new Error('usePega must be used within a PegaReadyProvider');
  }
  return context;
};
