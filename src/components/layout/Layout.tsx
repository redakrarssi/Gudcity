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
                <Link
                  to={user.role === 'customer' ? '/portal' : '/dashboard'}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/portal'))
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            <div className="hidden md:flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {user.email} <span className="text-xs text-gray-500">({user.role})</span>
                  </span>
                  
                  {/* Role Switcher */}
                  <div className="relative">
                    <button
                      onClick={() => setIsRoleSwitcherOpen(!isRoleSwitcherOpen)}
                      className="inline-flex items-center p-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
                      title="Switch User Role"
                    >
                      <UserCog className="h-4 w-4" />
                    </button>
                    
                    {isRoleSwitcherOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b">Switch Role</div>
                        <button
                          onClick={() => handleRoleSwitch('business')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            user.role === 'business' 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Business Portal
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('customer')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            user.role === 'customer' 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Customer Portal
                        </button>
                        <button
                          onClick={() => handleRoleSwitch('admin')}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            user.role === 'admin' 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Admin Portal
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={signOut}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 border-blue-600"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {user && (
              <Link
                to={user.role === 'customer' ? '/portal' : '/dashboard'}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/portal'))
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
          
          {user ? (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.email}</div>
                  <div className="text-sm font-medium text-gray-500">{user.role}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {/* Mobile Role Switcher */}
                <div className="px-4 py-2 text-xs text-gray-500">Switch Portal</div>
                <button
                  onClick={() => {
                    handleRoleSwitch('business');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-base font-medium ${
                    user.role === 'business' 
                      ? 'text-blue-700' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Business Portal
                </button>
                <button
                  onClick={() => {
                    handleRoleSwitch('customer');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-base font-medium ${
                    user.role === 'customer' 
                      ? 'text-blue-700' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Customer Portal
                </button>
                <button
                  onClick={() => {
                    handleRoleSwitch('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-base font-medium ${
                    user.role === 'admin' 
                      ? 'text-blue-700' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Admin Portal
                </button>
                
                {/* Sign out button */}
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 pt-4 pb-3">
              <div className="space-y-1 px-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
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
              <div className="mt-6 flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Our Services</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/services" className="text-sm text-gray-300 hover:text-white">
                    Loyalty Programs
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-sm text-gray-300 hover:text-white">
                    Customer Analytics
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-sm text-gray-300 hover:text-white">
                    Digital Rewards
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="text-sm text-gray-300 hover:text-white">
                    Business Integration
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Support</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/contact" className="text-sm text-gray-300 hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-300 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-300 hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Contact</h3>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <span className="text-sm text-gray-300">
                    123 Loyalty Street<br />
                    San Francisco, CA 94103
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-sm text-gray-300">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <span className="text-sm text-gray-300">info@gudcity.com</span>
                </li>
              </ul>
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