import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    proxy: {
      '/api-monitor': {
        target: 'https://dwindo.co.id/2slmonitor/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-monitor/, '')
      }
    }
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 90 << 16 // Targets Chrome 90+
      }
    }
  },
  build: {
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/pages/panel/') || id.includes('/src/components/layout/Panel') || id.includes('/src/pages/SA') || id.includes('/src/pages/WaBlast')) {
            return 'panel-app';
          }
          if (id.includes('node_modules')) {
            if (id.includes('xlsx') || id.includes('jspdf') || id.includes('html2canvas') || id.includes('recharts')) {
              return 'panel-vendors';
            }
            return 'vendor';
          }
        }
      }
    }
  }
})
