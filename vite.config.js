import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';

// Plugin to fix context refresh issues
const fixContextRefreshPlugin = () => {
  return {
    name: 'vite:fix-context-refresh',
    enforce: 'pre',
    transform(code, id) {
      // Only process JSX/TSX files
      if (!id.endsWith('.jsx') && !id.endsWith('.tsx')) {
        return null;
      }
      
      // Add hot.accept() to context files
      if (
        id.includes('Context') || 
        code.includes('createContext') || 
        (code.includes('useContext') && code.includes('export'))
      ) {
        // Check if the hot module code is already present
        if (!code.includes('import.meta.hot')) {
          return {
            code: code + `
// Fix for React Context HMR issues
if (import.meta.hot) {
  import.meta.hot.accept();
}`,
            map: null
          };
        }
      }
      
      return null;
    }
  };
};

export default defineConfig({
  // Base path - important for hosting in subdirectories
  base: '/',
  plugins: [
    fixContextRefreshPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'GudCity Loyalty',
        short_name: 'GudCity',
        description: 'GudCity Loyalty rewards program',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '64x64 128x128 256x256 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ],
  server: {
    hmr: {
      overlay: true
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['date-fns', 'nanoid', 'uuid'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['chart.js', 'react-chartjs-2']
        }
      }
    },
    // Create source maps for easier debugging
    sourcemap: true,
    // Improve chunk size warnings configuration
    chunkSizeWarningLimit: 1000
  }
}); 