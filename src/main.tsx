import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandling } from './utils/errorHandler';

// Setup global error handling for fetch errors and third-party script interference
setupGlobalErrorHandling();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
