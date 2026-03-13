import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        navigateFallbackAllowlist: [/^index.html$/] // Dev mode mein routing warning fix karne ke liye
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
      workbox: {
        // Essential for "Online First" behavior
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Explicitly define patterns to avoid warnings
        runtimeCaching: [
          {
            // Static assets (images, etc) can be cache first
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
})
