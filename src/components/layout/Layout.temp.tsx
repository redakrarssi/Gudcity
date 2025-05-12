import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Facebook, Twitter, Instagram, Linkedin, UserCog } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, setUserRole } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' }
  ];

  const dashboardLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Programs', path: '/dashboard/programs' },
    { name: 'Customers', path: '/dashboard/customers' },
    { name: 'Transactions', path: '/dashboard/transactions' }
  ];

  const handleRoleSwitch = (role: 'business' | 'customer' | 'admin') => {
    setUserRole(role);
    setIsRoleSwitcherOpen(false);
    
    // Navigate to the appropriate URL based on role
    if (role === 'customer') {
      navigate('/portal');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-blue-600 font-bold text-2xl">GudCity</span>
                <span className="text-gray-800 font-medium text-xl ml-1">Loyalty</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive(link.path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {user && (
                <div className="relative ml-3 group">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:outline-none"
                  >
                    <span>Dashboard</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Link>
                  <div className="hidden group-hover:block absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    {dashboardLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`block px-4 py-2 text-sm ${
                          isActive(link.path) ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-medium">About GudCity</h3>
              <p className="mt-4 text-sm text-gray-300">
                GudCity Loyalty provides businesses with powerful tools to create, manage, and grow customer loyalty programs that drive retention and increase revenue.
              </p>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-sm text-gray-400 text-center">
              &copy; {new Date().getFullYear()} GudCity Loyalty. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 