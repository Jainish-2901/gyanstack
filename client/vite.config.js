import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest', // Using custom consolidated SW
      srcDir: 'src',
      filename: 'sw.js', // Output will be public/sw.js 
      registerType: 'autoUpdate',
      devOptions: {
        // PERF: Disabled in dev — Workbox intercepts HMR/JSX requests in dev mode
        // causing 'Precaching did not find a match' spam and 453ms message handler violations.
        // Service worker is only meaningful on the production build.
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'logo.png'],
      manifest: {
        name: 'GyanStack - BCA/MCA Resource Hub',
        short_name: 'GyanStack',
        description: 'The Ultimate College Resource Hub for BCA/MCA Students',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
    })
  ],
  server: {
    port: 5173
  }
})
