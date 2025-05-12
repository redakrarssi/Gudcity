import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  BarChart3, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Store,
  ShieldCheck,
  AlertTriangle,
  Moon,
  Sun,
  FileText,
  Globe,
  Image
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string; message: string; read: boolean}>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Navigation items
  const navigationItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Business Management', path: '/admin/businesses', icon: Store },
    { name: 'Content Management', path: '/admin/content', icon: FileText },
    { name: 'Branding', path: '/admin/branding', icon: Image },
    { name: 'Rewards & Offers', path: '/admin/rewards', icon: Award },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'SEO Tools', path: '/admin/seo', icon: Globe },
    { name: 'System Logs', path: '/admin/logs', icon: AlertTriangle },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Handler for logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch notifications (in a real app, this would be from an API)
  useEffect(() => {
    // Mock notifications
    setNotifications([
      { id: '1', message: 'New user registration: John Doe', read: false },
      { id: '2', message: 'Business approval request: Coffee Shop', read: false },
      { id: '3', message: 'System update available', read: true },
    ]);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          className="fixed top-0 left-0 z-40 m-4 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}  
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-indigo-800 dark:bg-gray-800 transition-transform duration-300 ease-in-out transform 
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-auto flex flex-col
        `}
      >
        <div className="flex items-center justify-center h-16 px-4 bg-indigo-900 dark:bg-gray-900">
          <Link to="/admin" className="flex items-center">
            <ShieldCheck className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">Admin Portal</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 text-sm rounded-lg
                    ${location.pathname === item.path ? 
                      'bg-indigo-700 dark:bg-gray-700 text-white' : 
                      'text-white hover:bg-indigo-700 dark:hover:bg-gray-700'}
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 border-t border-indigo-700 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-gray-700"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Log out</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top nav */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              >
                {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</h3>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900' : ''
                            }`}
                          >
                            <p className="text-sm text-gray-700 dark:text-gray-300">{notification.message}</p>
                          </div>
                        ))
                      )}
                      
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <button 
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            setNotifications(notifications.map(n => ({ ...n, read: true })));
                            setShowNotifications(false);
                          }}
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User menu */}
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    {user?.email?.substring(0, 1).toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 