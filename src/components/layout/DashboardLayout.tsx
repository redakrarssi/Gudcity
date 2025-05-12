import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Tags, 
  BarChart3, 
  Settings, 
  ShoppingCart, 
  CreditCard, 
  Menu, 
  X, 
  Bell, 
  LogOut, 
  ChevronRight,
  Gift,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../hooks/useBusiness';

// Navigation items for the business dashboard
const businessNavigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Programs', path: '/dashboard/programs', icon: Tags },
  { name: 'Customers', path: '/dashboard/customers', icon: Users },
  { name: 'Cards', path: '/dashboard/cards', icon: CreditCard },
  { name: 'Transactions', path: '/dashboard/transactions', icon: ShoppingCart },
  { name: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

// Navigation items for the customer dashboard
const customerNavigationItems = [
  { name: 'My Dashboard', path: '/portal', icon: LayoutDashboard },
  { name: 'My Rewards', path: '/portal/rewards', icon: Gift },
  { name: 'My History', path: '/portal/transactions', icon: Clock },
  { name: 'Settings', path: '/portal/settings', icon: Settings },
];

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const { business } = useBusiness();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Authentication check removed to allow access to dashboard
  
  // Determine if a navigation link is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  // Determine which navigation items to show based on user role
  const navigationItems = user?.role === 'customer' ? customerNavigationItems : businessNavigationItems;
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}
      
      {/* Sidebar for mobile */}
      <div 
        className={`
          fixed inset-y-0 left-0 flex flex-col z-50 lg:static lg:flex-shrink-0 lg:flex
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: '16rem' }}
      >
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between flex-shrink-0 px-4 lg:hidden">
            <Link to="/" className="flex items-center">
              <span className="text-blue-600 font-bold text-xl">GudCity</span>
              <span className="text-gray-800 font-medium ml-1">Loyalty</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="h-10 w-10 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Logo - desktop only */}
          <div className="hidden lg:flex items-center justify-center h-16 flex-shrink-0 px-6 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <span className="text-blue-600 font-bold text-xl">GudCity</span>
              <span className="text-gray-800 font-medium ml-1">Loyalty</span>
            </Link>
          </div>
          
          {/* Business/User name and info */}
          <div className="px-4 py-4 border-b border-gray-200">
            {user?.role === 'customer' ? (
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {user?.displayName || user?.email?.split('@')[0] || 'Customer'}
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                  <span>Customer Portal</span>
                </div>
                {user?.points !== undefined && (
                  <div className="mt-2 bg-blue-50 rounded-md p-2">
                    <div className="text-sm font-medium text-blue-700">
                      {user.points} Points Available
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {business?.name || (user ? 'Your Business' : 'Guest')}
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span>Business Portal</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation links */}
          <div className="flex-grow mt-5 flex flex-col">
            <nav className="flex-1 px-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.path) 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 ${
                      isActive(item.path) 
                        ? 'text-blue-600' 
                        : 'text-gray-400 group-hover:text-blue-500'
                    }`} 
                  />
                  {item.name}
                  {isActive(item.path) && (
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-500" />
                  )}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User profile and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 font-medium">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.email || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">{user?.role || 'User'}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-auto flex-shrink-0 bg-white p-1 text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1 flex justify-end">
              <div className="ml-4 flex items-center md:ml-6">
                <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 