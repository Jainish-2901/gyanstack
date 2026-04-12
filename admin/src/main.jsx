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
      staleTime: 1000 * 60 * 2, // 2 minutes for admin
      retry: 1,
    },
  },
});

// PWA: Service Worker Registration (Only in Production)
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
       if (confirm('New admin update available. Reload?')) {
         window.location.reload();
       }
    },
    onOfflineReady() {
      console.log('Admin App ready to work offline (Static views only)');
    },
  });

  // Connection listeners
  window.addEventListener('online', () => console.log('Admin back online'));
  window.addEventListener('offline', () => console.log('Admin offline mode'));
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