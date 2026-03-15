import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Dead by Daylight Randomizer',
        short_name: 'DBDrando',
        description: 'A Dead by Daylight randomizer',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        start_url: '/',
        orientation: 'portrait',
        categories: ['games', 'entertainment'],
        display: 'standalone',
        icons: [
          {
            src: 'favicon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ],
})
