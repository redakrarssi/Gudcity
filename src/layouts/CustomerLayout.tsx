import React, { memo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Gift, UserCircle, CreditCard, ListChecks } from 'lucide-react';
import GudcityLogo from '../assets/logo';

// Navigation items - defined outside component to prevent re-creation on render
const navigationItems = [
  { name: 'Dashboard', href: '/portal', icon: Home },
  { name: 'My Programs', href: '/portal/programs', icon: ListChecks },
  { name: 'Rewards', href: '/portal/rewards', icon: Gift },
  { name: 'My Cards', href: '/portal/cards', icon: CreditCard },
  { name: 'Profile', href: '/portal/profile', icon: UserCircle },
];

// Memoized navigation link component
const NavLink = memo(({ item, pathname }: { 
  item: typeof navigationItems[0], 
  pathname: string 
}) => {
  const isActive = pathname === item.href;
  const Icon = item.icon;
  
  return (
    <Link
      to={item.href}
      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
        isActive
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="h-5 w-5 mr-1" />
      {item.name}
    </Link>
  );
});

// Memoized mobile navigation link component
const MobileNavLink = memo(({ item, pathname }: { 
  item: typeof navigationItems[0], 
  pathname: string 
}) => {
  const isActive = pathname === item.href;
  const Icon = item.icon;
  
  return (
    <Link
      to={item.href}
      className={`flex flex-col items-center py-2 ${
        isActive
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs mt-1">{item.name}</span>
    </Link>
  );
});

// Header with logo and navigation
const Header = memo(({ pathname }: { pathname: string }) => (
  <nav className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center">
            <GudcityLogo width={150} height={60} />
          </div>
        </div>
        <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
          {navigationItems.map((item) => (
            <NavLink key={item.name} item={item} pathname={pathname} />
          ))}
        </div>
      </div>
    </div>
  </nav>
));

// Mobile navigation bar (fixed at bottom)
const MobileNavBar = memo(({ pathname }: { pathname: string }) => (
  <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
    <div className="flex justify-around">
      {navigationItems.map((item) => (
        <MobileNavLink key={item.name} item={item} pathname={pathname} />
      ))}
    </div>
  </div>
));

// Main content area
const MainContent = memo(() => (
  <div className="py-10">
    <main>
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </main>
  </div>
));

// CustomerLayout component with performance optimizations
const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header pathname={pathname} />
      <MainContent />
      <MobileNavBar pathname={pathname} />
    </div>
  );
};

export default memo(CustomerLayout); 