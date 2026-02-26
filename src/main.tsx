import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug OTA: Captura erros de boot e salva no localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const errorMsg = `[BOOT_ERROR] ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
    localStorage.setItem('lastOTAError', errorMsg);
    console.error(errorMsg);
  });
  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = `[BOOT_REJECTION] ${event.reason}`;
    localStorage.setItem('lastOTAError', errorMsg);
    console.error(errorMsg);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
