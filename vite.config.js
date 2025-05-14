import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
  plugins: [
    fixContextRefreshPlugin(),
    react({
      // Completely disable Fast Refresh for now as a more reliable solution
      fastRefresh: false,
    })
  ],
  server: {
    hmr: {
      // Better error overlay handling
      overlay: true
    }
  }
}); 