import React, { memo } from 'react';
import { Outlet, Link } from 'react-router-dom';
import GudcityLogo from '../assets/logo';

// Logo component memoized to prevent unnecessary re-renders
const Logo = memo(() => (
  <div className="flex justify-center">
    <Link to="/" className="flex items-center">
      <GudcityLogo width={200} height={80} />
    </Link>
  </div>
));

// Content area with form content
const ContentArea = memo(() => (
  <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
    <Outlet />
  </div>
));

// Back to home link
const BackLink = memo(() => (
  <div className="mt-6 text-center text-sm">
    <Link to="/" className="text-blue-600 hover:text-blue-500">
      Back to Home
    </Link>
  </div>
));

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Logo />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <ContentArea />
        <BackLink />
      </div>
    </div>
  );
};

export default memo(AuthLayout);