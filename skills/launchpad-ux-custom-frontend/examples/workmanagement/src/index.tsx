import { createRoot } from 'react-dom/client';
import AppShell from './components/AppShell';

const appElement = document.getElementById('app');

if (appElement) {
  const root = createRoot(appElement);
  root.render(<AppShell />);
}
