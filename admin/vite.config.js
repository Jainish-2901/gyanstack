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
        navigateFallbackAllowlist: [/^index.html$/]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'logo.png'],
      manifest: {
        name: 'GyanStack - Admin Portal',
        short_name: 'GS Admin',
        description: 'Manage and Moderate GyanStack Resources',
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
        runtimeCaching: [
          {
            // API calls should always try the network first (Online Access)
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
            handler: 'NetworkOnly', // Changed to NetworkOnly to strictly require internet for Admin
          },
          {
            // Static assets (images, etc) can be cache first for performance
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
  server: { port: 5174 }
})
