import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { BusinessProvider } from './contexts/BusinessContext';
import { collectWebVitals } from './utils/performanceMonitor';
import { Toaster } from 'react-hot-toast';

// Global error handler
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
    
    // Log error to session storage for debugging
    try {
      const errorLog = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        info: errorInfo,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem('app_error_log', JSON.stringify(errorLog));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              {this.state.error?.message || 'An unexpected error occurred in the application.'}
            </p>
            <div className="bg-red-50 p-4 rounded-md text-sm text-red-800 mb-6 overflow-auto max-h-40">
              <pre>{this.state.error?.stack}</pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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

// Custom toast styles
const toastOptions = {
  style: {
    borderRadius: '10px',
    background: '#333',
    color: '#fff',
  },
  success: {
    style: {
      background: '#10B981',
      color: '#fff',
    },
  },
  error: {
    style: {
      background: '#EF4444',
      color: '#fff',
    },
  },
};

// Render the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  // In development, we keep StrictMode for better debugging
  // In production, we remove it for better performance
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <BusinessProvider>
              <App />
              <Toaster position="top-right" toastOptions={toastOptions} />
            </BusinessProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  ) : (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <App />
            <Toaster position="top-right" toastOptions={toastOptions} />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
);