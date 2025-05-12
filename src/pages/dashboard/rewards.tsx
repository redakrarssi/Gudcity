import React, { useState } from 'react';
import { Gift, ChevronRight, Tag, Clock, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface Reward {
  id: string;
  business: string;
  title: string;
  description: string;
  pointsRequired: number;
  expiresAt: string;
  isAvailable: boolean;
}

interface RedeemedReward {
  id: string;
  business: string;
  title: string;
  description: string;
  pointsRequired: number;
  redeemedAt: string;
}

const Rewards: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available');

  // Determine if we're in the customer portal
  const isCustomerPortal = location.pathname.startsWith('/portal');

  // Mock data for rewards
  const availableRewards: Reward[] = [
    {
      id: 'reward-1',
      business: 'CoffeeShop',
      title: 'Free Coffee',
      description: 'Redeem for a free coffee of any size',
      pointsRequired: 100,
      expiresAt: '2023-12-31',
      isAvailable: true
    },
    {
      id: 'reward-2',
      business: 'CoffeeShop',
      title: '50% Off Pastry',
      description: 'Get any pastry for half price',
      pointsRequired: 75,
      expiresAt: '2023-12-31',
      isAvailable: true
    },
    {
      id: 'reward-3',
      business: 'CoffeeShop',
      title: 'Buy One Get One Free',
      description: 'Purchase any drink and get another one free',
      pointsRequired: 200,
      expiresAt: '2023-12-31',
      isAvailable: true
    },
  ];

  const redeemedRewards: RedeemedReward[] = [
    {
      id: 'reward-4',
      business: 'CoffeeShop',
      title: 'Free Bagel',
      description: 'Redeemed for a free bagel with cream cheese',
      pointsRequired: 80,
      redeemedAt: '2023-10-15',
    },
    {
      id: 'reward-5',
      business: 'CoffeeShop',
      title: 'Free Espresso Shot',
      description: 'Added to any drink of your choice',
      pointsRequired: 50,
      redeemedAt: '2023-09-22',
    },
  ];

  const canRedeem = (pointsRequired: number) => {
    return user?.points && user.points >= pointsRequired;
  };

  const handleRedeem = (reward: Reward) => {
    // Handle redemption logic here
    alert(`You have redeemed: ${reward.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isCustomerPortal ? 'My Rewards' : 'Rewards'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isCustomerPortal 
              ? 'View and redeem your rewards from CoffeeShop' 
              : 'Manage rewards for your loyalty program'}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg px-4 py-2 flex items-center">
          <Gift className="h-5 w-5 text-blue-500 mr-2" />
          <span className="font-medium text-blue-700">{user?.points || 0} Points Available</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isCustomerPortal ? 'Available Rewards' : 'Active Rewards'}
          </button>
          <button
            onClick={() => setActiveTab('redeemed')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'redeemed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isCustomerPortal ? 'My Redemption History' : 'Redeemed Rewards'}
          </button>
        </nav>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'available' ? (
          availableRewards.length > 0 ? (
            availableRewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <h3 className="text-lg font-medium text-white">{reward.title}</h3>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-gray-600">{reward.description}</p>
                  
                  {isCustomerPortal && (
                    <div className="flex items-center">
                      <Store className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-700">{reward.business}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700 font-medium">{reward.pointsRequired} Points</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-700">Expires: {reward.expiresAt}</span>
                  </div>
                  
                  <Button 
                    variant={canRedeem(reward.pointsRequired) ? "primary" : "secondary"}
                    disabled={!canRedeem(reward.pointsRequired)}
                    className="w-full"
                    onClick={() => canRedeem(reward.pointsRequired) && handleRedeem(reward)}
                  >
                    {canRedeem(reward.pointsRequired) ? 'Redeem Reward' : 'Not Enough Points'}
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No rewards available</h3>
              <p className="mt-1 text-sm text-gray-500">Check back soon for new rewards to redeem.</p>
            </div>
          )
        ) : (
          redeemedRewards.length > 0 ? (
            redeemedRewards.map((reward) => (
              <Card key={reward.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-4">
                  <h3 className="text-lg font-medium text-white">{reward.title}</h3>
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-gray-600">{reward.description}</p>
                  
                  {isCustomerPortal && (
                    <div className="flex items-center">
                      <Store className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">{reward.business}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700 font-medium">{reward.pointsRequired} Points</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">Redeemed on: {reward.redeemedAt}</span>
                  </div>
                  
                  <div className="bg-gray-100 text-gray-600 text-center py-2 rounded-md font-medium">
                    Redeemed
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No redeemed rewards</h3>
              <p className="mt-1 text-sm text-gray-500">You haven't redeemed any rewards yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Rewards; 