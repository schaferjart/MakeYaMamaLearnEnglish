import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './hooks/useAuth'
import { LocaleProvider } from './lib/locale'

createRoot(document.getElementById("root")!).render(
  <LocaleProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </LocaleProvider>
);
