import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to preserve React context references during HMR
const preserveContextRefPlugin = () => {
  const preserveRefFunc = `
  function __preserveRef(key, v) {
    if (import.meta.env.PROD) return v;
    
    import.meta.hot.data ??= {}
    import.meta.hot.data.contexts ??= {}
    const old = import.meta.hot.data.contexts[key];
    const now = old || v;
    
    import.meta.hot.on('vite:beforeUpdate', () => {
      import.meta.hot.data.contexts[key] = now;
    });
    
    return now;
  }
  `;
  
  const createContextRegEx = /(import.*createContext.*react)|(React.createContext.*\(.*\))/;
  const oldCreateRegex = /(const|let|var) (.*) = ((React\.createContext.*)|(createContext.*));/g;
  
  return {
    name: 'vite:preserve-context-refs',
    transform(code, id) {
      if (!id.match(/\.(jsx|tsx|js|ts)$/) || !code.match(createContextRegEx)) {
        return null;
      }
      
      const newCode = code.replace(oldCreateRegex, 
        (match, declType, contextName, createExpr) => {
          return `${declType} ${contextName} = __preserveRef("${contextName}",${createExpr});`;
        }
      );
      
      // Only add the helper function if we actually transformed something
      if (newCode !== code) {
        return {
          code: newCode + preserveRefFunc,
          map: null
        };
      }
      
      return null;
    }
  };
};

export default defineConfig({
  plugins: [
    preserveContextRefPlugin(),
    react({
      // Ensure Fast Refresh is enabled
      fastRefresh: true,
    })
  ],
  // ... rest of your config
}); 