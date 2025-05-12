import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import { collectWebVitals } from './utils/performanceMonitor';

// Speed optimization: Preconnect to Supabase and other domains
const preconnectLinks = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  // Assuming Supabase URL, update or remove if different
  { rel: 'preconnect', href: 'https://supabase.co' }
];

// Add preconnect links to document head
preconnectLinks.forEach(link => {
  const linkEl = document.createElement('link');
  Object.entries(link).forEach(([key, value]) => {
    if (value !== undefined) {
      linkEl.setAttribute(key, value);
    }
  });
  document.head.appendChild(linkEl);
});

// Set up bypass auth for testing
window.BYPASS_AUTH = true;

// Log that test mode is active
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Test Mode Active: Using mock authentication and data');
}

// Start collecting performance metrics
collectWebVitals();

// Performance optimization: Use a passive listener for touchstart events
document.addEventListener('touchstart', () => {}, { passive: true });

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  // In development, we keep StrictMode for better debugging
  // In production, we remove it for better performance
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <App />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  ) : (
    <BrowserRouter>
      <AuthProvider>
        <BusinessProvider>
          <App />
        </BusinessProvider>
      </AuthProvider>
    </BrowserRouter>
  )
);