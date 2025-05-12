import React, { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import LoadingScreen from '../ui/LoadingScreen';

// Lazy-loaded components to reduce initial bundle size
const Footer = lazy(() => import('./Footer'));

const AppShell: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 mx-auto max-w-7xl w-full">
            <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
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