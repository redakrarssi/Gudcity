import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LoadingIndicator from '../ui/LoadingIndicator';

// Lazy-loaded components to reduce initial bundle size
const Footer = lazy(() => import('./Footer'));

const AppShell: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check API health on component mount
    checkApiHealth();
    
    // Set a timeout to show an error if things are taking too long
    const timeoutId = setTimeout(() => {
      if (apiHealth === 'checking') {
        setApiHealth('offline');
        setErrorMessage('Application is taking longer than expected to load. Please check your connection.');
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [apiHealth]);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setApiHealth(data.database === 'connected' ? 'online' : 'offline');
        if (data.database !== 'connected') {
          setErrorMessage('Unable to connect to the database. Please try again later.');
        }
      } else {
        setApiHealth('offline');
        setErrorMessage('API is currently unavailable. Please try again later.');
      }
    } catch (err) {
      console.error('API health check failed:', err);
      setApiHealth('offline');
      setErrorMessage('Failed to connect to the API. Please check your internet connection.');
    }
  };

  // Show loading state while API health is being checked
  if (apiHealth === 'checking') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <LoadingIndicator message="Loading application..." />
      </div>
    );
  }

  // Show error message if API is offline
  if (apiHealth === 'offline' && errorMessage) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 mb-6">{errorMessage}</p>
          <button
            onClick={() => {
              setApiHealth('checking');
              setErrorMessage(null);
              checkApiHealth();
            }}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 mx-auto max-w-7xl w-full">
            <Suspense fallback={<LoadingIndicator />}>
              <Outlet />
            </Suspense>
          </main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AppShell; 