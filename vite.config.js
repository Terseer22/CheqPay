import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'public/*.png'],
      manifest: {
        name: 'Cheqpay',
        short_name: 'Cheqpay',
        description: 'Send money, pay bills fast with Cheqpay',
        theme_color: '#F59E0B',
        background_color: '#F59E0B',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/public/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/public/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/public/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
})