import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';

// 1. Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// 2. Bootstrap JS (Dropdowns ke liye zaroori)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// 3. Hamari custom CSS
import './App.css'; 

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// PWA: Service Worker Registration (Production Only)
// SW is disabled in dev (vite.config.js devOptions.enabled: false) to prevent
// Workbox from intercepting HMR/JSX source files and causing console violations.
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
       if (confirm('New content available. Reload?')) {
         window.location.reload();
       }
    },
    onOfflineReady() {
      console.log('GyanStack: App ready to work offline');
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);