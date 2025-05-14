import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const LoadingScreen = () => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 5000); // Show timeout message after 5 seconds

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Loading GudCity Loyalty...
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Preparing your loyalty management system
        </p>
        {showTimeoutMessage && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Taking longer than usual? Try refreshing the page or check your internet connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;