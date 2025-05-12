import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PointCodeRedeemer from '../../components/codes/PointCodeRedeemer';
import { useNavigate } from 'react-router-dom';
import { Confetti } from '../../components/ui/Confetti';

const RedeemCode: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Handle successful code redemption
  const handleCodeSuccess = (pointAmount: number) => {
    setEarnedPoints(pointAmount);
    setShowConfetti(true);
    
    // Hide confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate('/portal');
  };

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">You need to be logged in to redeem codes.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Redeem a Code</h1>
      
      {showConfetti && <Confetti />}
      
      {showConfetti && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
          <h2 className="text-xl font-semibold text-green-700 mb-2">Success! 🎉</h2>
          <p className="text-lg mb-4">
            You've earned <span className="font-bold">{earnedPoints} points</span>!
          </p>
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            View My Dashboard
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          <PointCodeRedeemer onSuccess={handleCodeSuccess} />
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="font-semibold text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Enter your code</h3>
                  <p className="text-sm text-gray-600">Type the code you received from a business or promotion.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="font-semibold text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Redeem instantly</h3>
                  <p className="text-sm text-gray-600">Your points will be credited to your account immediately.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="font-semibold text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Enjoy your rewards</h3>
                  <p className="text-sm text-gray-600">Use your points to get rewards at your favorite businesses.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-2">Where to find codes?</h3>
              <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                <li>Online purchases and receipts</li>
                <li>Email promotions from businesses</li>
                <li>Special events and marketing materials</li>
                <li>Loyalty program newsletters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedeemCode; 