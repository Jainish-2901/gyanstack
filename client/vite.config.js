import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'logo.png'],
      manifest: {
        name: 'GyanStack | Resource Hub',
        short_name: 'GyanStack',
        description: 'The Ultimate College Resource Hub for BCA/MCA Students',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192-v2.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512-v2.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-v2.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
    })
  ],
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
    }
  }
})
