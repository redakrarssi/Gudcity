import React, { useState } from 'react';
import { CustomerLoyaltyCard } from '../../components/cards';
import { useAuth } from '../../hooks/useAuth';
import { QrCode, CreditCard, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample business data
const SAMPLE_BUSINESS = {
  id: 'biz-123',
  name: 'Coffee Haven',
  logo: '/assets/coffee-logo.png',
  address: '789 Brew Street, Coffee Town, CT 10101',
  phone: '(555) 234-5678',
  email: 'hello@coffeehaven.com',
  description: 'Artisanal coffee and pastries made with love'
};

// Sample program data
const SAMPLE_PROGRAM = {
  id: 'prog-456',
  name: 'Bean Lovers Rewards',
  description: 'Earn points with every purchase, redeem for free drinks and treats!',
  pointsPerPurchase: 10,
  rewardThreshold: 100,
  rewardDescription: 'Free specialty coffee or pastry of your choice'
};

const LoyaltyCardsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentPoints, setCurrentPoints] = useState(35);
  
  // Extract user display name, handling null case
  const userDisplayName = user?.displayName || undefined;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-8">
        Your Loyalty Cards
      </h1>
      
      {/* Join New Program Card - Fancy Design */}
      <div className="mb-12 bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 relative">
          {/* Background patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white transform -translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Join a Loyalty Program</h2>
              
              <p className="text-purple-100 mb-6 max-w-xl">
                Connect with your favorite local businesses and start earning rewards every time you shop.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <button className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all group">
                    <div className="p-3 bg-white/20 rounded-full mr-4 group-hover:bg-white/30">
                      <QrCode className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Scan Business QR Code</h3>
                      <p className="text-sm text-purple-100">Point your camera at a business QR code to join instantly</p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-white/70 group-hover:text-white" />
                  </button>
                  
                  <button className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all group">
                    <div className="p-3 bg-white/20 rounded-full mr-4 group-hover:bg-white/30">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Enter Program Code</h3>
                      <p className="text-sm text-purple-100">Got a code from a business? Enter it to join their program</p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-white/70 group-hover:text-white" />
                  </button>
                  
                  <button className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all group">
                    <div className="p-3 bg-white/20 rounded-full mr-4 group-hover:bg-white/30">
                      <Search className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Browse Directory</h3>
                      <p className="text-sm text-purple-100">Find local businesses that offer loyalty programs</p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-white/70 group-hover:text-white" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-5 flex items-center justify-center">
              <div className="relative transform hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-2xl"></div>
                <div className="relative">
                  <CustomerLoyaltyCard
                    businessId={SAMPLE_BUSINESS.id}
                    businessName={SAMPLE_BUSINESS.name}
                    businessLogo={SAMPLE_BUSINESS.logo}
                    programId={SAMPLE_PROGRAM.id}
                    programName={SAMPLE_PROGRAM.name}
                    pointsBalance={currentPoints}
                    rewardThreshold={SAMPLE_PROGRAM.rewardThreshold}
                    rewardDescription={SAMPLE_PROGRAM.rewardDescription}
                    customerName={userDisplayName}
                    customerId={user?.uid || undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-2">For Businesses:</h3>
            <ol className="list-decimal list-inside ml-2 space-y-2 text-gray-700">
              <li>Create your unique business loyalty card</li>
              <li>Share the QR code with customers to join your program</li>
              <li>Scan customer QR codes to award points for purchases</li>
              <li>Track customer loyalty and automatically apply rewards</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">For Customers:</h3>
            <ol className="list-decimal list-inside ml-2 space-y-2 text-gray-700">
              <li>Scan business QR code to join a loyalty program</li>
              <li>Show your QR code when making purchases</li>
              <li>Earn points with each transaction</li>
              <li>Redeem points for rewards when you reach the threshold</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCardsPage;