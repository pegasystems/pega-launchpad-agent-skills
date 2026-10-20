import PegaAuthProvider from '../../context/PegaAuthProvider';
import { PegaReadyProvider } from '../../context/PegaReadyContext';
import { theme } from '../../theme';
import Header from '../Header';
import Dashboard from '../Dashboard';

export default function AppShell() {
  return (
    <PegaAuthProvider>
      <PegaReadyProvider theme={theme}>
        <Header />
        <Dashboard />
      </PegaReadyProvider>
    </PegaAuthProvider>
  );
}
