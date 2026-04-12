import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'img/icons/apple-touch-icon.png',
        'img/icons/favicon-16x16.png',
        'img/icons/favicon-32x32.png',
        'img/icons/mstile-150x150.png',
        'img/icons/safari-pinned-tab.svg',
      ],
      manifest: {
        name: 'Baden Battle Score App',
        short_name: 'Baden Battle',
        theme_color: '#003F87',
        background_color: '#f2f2f2',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'img/icons/android-chrome-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'img/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'img/icons/favicon-16x16.png',
            sizes: '16x16',
            type: 'image/png',
          },
          {
            src: 'img/icons/favicon-32x32.png',
            sizes: '32x32',
            type: 'image/png',
          },
          {
            src: 'img/icons/mstile-150x150.png',
            sizes: '150x150',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  server: {
    host: '127.0.0.1',
  },
  build: {
    sourcemap: true,
  },
})
