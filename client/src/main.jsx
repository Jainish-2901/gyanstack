import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';

// 1. Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
// 2. Bootstrap JS (Dropdowns ke liye zaroori)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// 3. Hamari custom CSS
import './App.css'; 

// PWA: Service Worker Registration (Only in Production)
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
       if (confirm('New content available. Reload?')) {
         window.location.reload();
       }
    },
    onOfflineReady() {
      console.log('App ready to work offline');
    },
  });

  // Connection listeners
  window.addEventListener('online', () => {
    console.log('App is back online');
    // You could trigger a toast here if you have a toast system
  });
  window.addEventListener('offline', () => {
    console.log('App is in offline mode');
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);