import React, { useState, memo, useCallback } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import GudcityLogo from '../assets/logo';
import {
  LayoutDashboard,
  Users,
  Tag,
  BarChart3,
  Settings,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Bell,
  CreditCard
} from 'lucide-react';

// Memoized navigation items to prevent re-rendering
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Programs', href: '/dashboard/programs', icon: Tag },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Cards', href: '/dashboard/cards', icon: CreditCard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: ShoppingCart },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

// Optimized navigation link component
const NavLink = memo(({ item, pathname }: { 
  item: typeof navigationItems[0], 
  pathname: string
}) => {
  const isActive = pathname === item.href;
  const Icon = item.icon;
  
  return (
    <Link
      to={item.href}
      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
        isActive
          ? 'bg-gray-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon
        className={`mr-3 h-5 w-5 ${
          isActive
            ? 'text-blue-600'
            : 'text-gray-400 group-hover:text-gray-500'
        }`}
      />
      {item.name}
    </Link>
  );
});

// Mobile navigation link
const MobileNavLink = memo(({ item, pathname }: { 
  item: typeof navigationItems[0], 
  pathname: string
}) => {
  const isActive = pathname === item.href;
  const Icon = item.icon;
  
  return (
    <Link
      to={item.href}
      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
        isActive
          ? 'bg-gray-100 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon
        className={`mr-4 h-6 w-6 ${
          isActive
            ? 'text-blue-600'
            : 'text-gray-400 group-hover:text-gray-500'
        }`}
      />
      {item.name}
    </Link>
  );
});

// Sidebar component
const Sidebar = memo(({ pathname }: { pathname: string }) => (
  <div className="hidden lg:flex lg:flex-shrink-0">
    <div className="flex flex-col w-64">
      <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <GudcityLogo width={150} height={60} />
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
            {navigationItems.map((item) => (
              <NavLink key={item.name} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  </div>
));

// Mobile sidebar
const MobileSidebar = memo(({ isOpen, onClose, pathname, onLogout }: { 
  isOpen: boolean, 
  onClose: () => void, 
  pathname: string,
  onLogout: () => void
}) => (
  <div
    className={`fixed inset-0 flex z-40 lg:hidden ${
      isOpen ? 'block' : 'hidden'
    }`}
    role="dialog"
    aria-modal="true"
  >
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-75"
      aria-hidden="true"
      onClick={onClose}
    ></div>

    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
      <div className="absolute top-0 right-0 -mr-12 pt-2">
        <button
          type="button"
          className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          onClick={onClose}
        >
          <span className="sr-only">Close sidebar</span>
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
        <div className="flex-shrink-0 flex items-center px-4">
          <GudcityLogo width={150} height={60} />
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navigationItems.map((item) => (
            <MobileNavLink key={item.name} item={item} pathname={pathname} />
          ))}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <button
          onClick={onLogout}
          className="flex-shrink-0 group block w-full text-left"
        >
          <div className="flex items-center">
            <div>
              <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            </div>
            <div className="ml-3">
              <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                Logout
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
));

// Main content header
const Header = memo(({ 
  onOpenSidebar, 
  user, 
  businessName 
}: { 
  onOpenSidebar: () => void, 
  user: any, 
  businessName: string | undefined 
}) => (
  <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
    <button
      type="button"
      className="px-4 border-r border-gray-200 text-gray-500 lg:hidden"
      onClick={onOpenSidebar}
    >
      <span className="sr-only">Open sidebar</span>
      <Menu className="h-6 w-6" />
    </button>
    <div className="flex-1 px-4 flex justify-between">
      <div className="flex-1 flex">
        <h1 className="text-xl font-semibold text-gray-900 self-center">
          {businessName || 'Your Business'}
        </h1>
      </div>
      <div className="ml-4 flex items-center md:ml-6">
        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" />
        </button>

        <div className="ml-3 relative">
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500">
              <span className="text-sm font-medium leading-none text-white">
                {user?.email?.[0].toUpperCase() || 'U'}
              </span>
            </span>
            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { business } = useBusiness();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }, [logout, navigate]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        pathname={location.pathname}
        onLogout={handleLogout}
      />

      {/* Desktop sidebar */}
      <Sidebar pathname={location.pathname} />

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header 
          onOpenSidebar={openSidebar} 
          user={user} 
          businessName={business?.name} 
        />

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

export default memo(DashboardLayout);