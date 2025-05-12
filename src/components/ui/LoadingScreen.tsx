import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
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
      </div>
    </div>
  );
};

export default LoadingScreen;