import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <footer className={`py-4 px-6 ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-600'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
        <div>
          <p>&copy; {new Date().getFullYear()} Gudcity. All rights reserved.</p>
        </div>
        <div className="mt-2 md:mt-0">
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Terms of Service</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 