import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { CreditCard, Award, ChevronRight, Store } from 'lucide-react';

// Sample data for customer's loyalty programs
const SAMPLE_PROGRAMS = [
  {
    id: 'prog-123',
    businessId: 'biz-123',
    businessName: 'Coffee Haven',
    businessLogo: '/assets/coffee-logo.png',
    programName: 'Bean Lovers Rewards',
    pointsBalance: 75,
    rewardThreshold: 100,
    rewardDescription: 'Free specialty coffee or pastry of your choice',
    memberSince: '2023-05-15'
  },
  {
    id: 'prog-456',
    businessId: 'biz-456',
    businessName: 'Bookworm Paradise',
    businessLogo: '/assets/book-logo.png',
    programName: 'Reader Rewards',
    pointsBalance: 45,
    rewardThreshold: 200,
    rewardDescription: 'Free book under $20',
    memberSince: '2023-07-22'
  },
  {
    id: 'prog-789',
    businessId: 'biz-789',
    businessName: 'Pizza Palace',
    businessLogo: '/assets/pizza-logo.png',
    programName: 'Slice Rewards',
    pointsBalance: 130,
    rewardThreshold: 150,
    rewardDescription: 'Free large pizza with two toppings',
    memberSince: '2023-04-10'
  }
];

const MyProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const [loyaltyPrograms, setLoyaltyPrograms] = useState(SAMPLE_PROGRAMS);
  const [sortBy, setSortBy] = useState<'name' | 'points' | 'recent'>('points');
  
  // Sort programs based on selected criteria
  useEffect(() => {
    const sortedPrograms = [...loyaltyPrograms];
    
    switch(sortBy) {
      case 'name':
        sortedPrograms.sort((a, b) => a.businessName.localeCompare(b.businessName));
        break;
      case 'points':
        sortedPrograms.sort((a, b) => {
          // Sort by how close to reward (percentage)
          const aPercent = (a.pointsBalance / a.rewardThreshold) * 100;
          const bPercent = (b.pointsBalance / b.rewardThreshold) * 100;
          return bPercent - aPercent;
        });
        break;
      case 'recent':
        sortedPrograms.sort((a, b) => {
          return new Date(b.memberSince).getTime() - new Date(a.memberSince).getTime();
        });
        break;
    }
    
    setLoyaltyPrograms(sortedPrograms);
  }, [sortBy]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Loyalty Programs</h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === 'points' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              onClick={() => setSortBy('points')}
            >
              Rewards Progress
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === 'name' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              onClick={() => setSortBy('name')}
            >
              Name
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                sortBy === 'recent' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              onClick={() => setSortBy('recent')}
            >
              Recently Joined
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6">
        {loyaltyPrograms.map(program => {
          // Calculate progress percentage
          const progressPercent = Math.min(Math.round((program.pointsBalance / program.rewardThreshold) * 100), 100);
          
          // Format date
          const memberSinceFormatted = new Date(program.memberSince).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          // Determine if eligible for reward
          const isEligibleForReward = program.pointsBalance >= program.rewardThreshold;
          
          return (
            <Card key={program.id} className="overflow-hidden">
              <div className="md:flex">
                {/* Business Logo and Info */}
                <div className="flex-shrink-0 md:w-1/4 bg-gray-50 p-4 flex flex-col items-center justify-center">
                  <div className="rounded-full w-16 h-16 flex items-center justify-center bg-white shadow-sm overflow-hidden mb-3">
                    {program.businessLogo ? (
                      <img
                        src={program.businessLogo}
                        alt={`${program.businessName} logo`}
                        className="object-contain w-12 h-12"
                      />
                    ) : (
                      <Store className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-medium text-center">{program.businessName}</h3>
                  <p className="text-sm text-gray-500 text-center">{program.programName}</p>
                </div>
                
                {/* Points and Progress */}
                <div className="flex-grow p-4 md:p-6 border-t md:border-t-0 md:border-l border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-blue-600">{program.pointsBalance}</span>
                      <span className="text-gray-500 ml-1">points</span>
                      
                      <div className="text-sm text-gray-600 mt-1">
                        Member since {memberSinceFormatted}
                      </div>
                    </div>
                    
                    <div className="mt-3 md:mt-0 md:text-right">
                      <div className="text-sm">
                        <span className="font-medium">Reward at: </span>
                        <span>{program.rewardThreshold} points</span>
                      </div>
                      
                      {isEligibleForReward ? (
                        <div className="mt-1 text-green-600 text-sm font-medium flex items-center md:justify-end">
                          <Award className="w-4 h-4 mr-1" />
                          Reward available!
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 mt-1">
                          {program.rewardThreshold - program.pointsBalance} points until next reward
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full ${
                        isEligibleForReward ? 'bg-green-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="font-medium">Reward: </span>
                      <span>{program.rewardDescription}</span>
                    </div>
                    
                    <Link 
                      to={`/portal/cards?business=${program.businessId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    >
                      View Card
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Empty State */}
      {loyaltyPrograms.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No loyalty programs yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Visit businesses and scan their loyalty QR codes to join programs and start earning rewards.
          </p>
        </div>
      )}
    </div>
  );
};

export default MyProgramsPage; 