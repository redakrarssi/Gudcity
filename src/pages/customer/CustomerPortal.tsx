import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { ListChecks, CreditCard, Gift, ChevronRight, Award, ArrowRight, ExternalLink, PlusCircle, QrCode } from 'lucide-react';
import { CustomerLoyaltyCard } from '../../components/cards';

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
    rewardDescription: 'Free specialty coffee or pastry of your choice'
  },
  {
    id: 'prog-456',
    businessId: 'biz-456',
    businessName: 'Bookworm Paradise',
    businessLogo: '/assets/book-logo.png',
    programName: 'Reader Rewards',
    pointsBalance: 45,
    rewardThreshold: 200,
    rewardDescription: 'Free book under $20'
  },
  {
    id: 'prog-789',
    businessId: 'biz-789',
    businessName: 'Pizza Palace',
    businessLogo: '/assets/pizza-logo.png',
    programName: 'Slice Rewards',
    pointsBalance: 130,
    rewardThreshold: 150,
    rewardDescription: 'Free large pizza with two toppings'
  }
];

const CustomerPortal: React.FC = () => {
  const { user } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState(SAMPLE_PROGRAMS[0]);
  
  // Calculate summary statistics
  const totalPrograms = SAMPLE_PROGRAMS.length;
  const totalPoints = SAMPLE_PROGRAMS.reduce((sum, program) => sum + program.pointsBalance, 0);
  const availableRewards = SAMPLE_PROGRAMS.filter(program => program.pointsBalance >= program.rewardThreshold).length;
  
  // Find program closest to reward
  const sortedByProgress = [...SAMPLE_PROGRAMS].sort((a, b) => {
    const aRemaining = a.rewardThreshold - a.pointsBalance;
    const bRemaining = b.rewardThreshold - b.pointsBalance;
    return aRemaining - bRemaining;
  });
  
  const nextReward = sortedByProgress.find(program => program.pointsBalance < program.rewardThreshold);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {user?.displayName || 'Valued Customer'}</h1>
      </div>
      
      {/* Join New Program Card - Single Fancy Design */}
      <div className="mb-8 bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-8 relative">
          {/* Background patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white transform -translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">Your Loyalty Passport</h2>
              
              <p className="text-purple-100 mb-6 max-w-xl">
                Join loyalty programs from your favorite businesses and earn rewards with every visit.
              </p>
              
              {selectedProgram && SAMPLE_PROGRAMS.length > 0 ? (
                <>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/20">
                    <h3 className="text-lg font-medium text-white mb-2">Active Programs</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {SAMPLE_PROGRAMS.map(program => (
                        <button
                          key={program.id}
                          onClick={() => setSelectedProgram(program)}
                          className={`px-3 py-1.5 text-xs rounded-md flex items-center ${
                            selectedProgram.id === program.id 
                              ? 'bg-white text-purple-700 font-medium' 
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          <div className="w-4 h-4 mr-1.5 overflow-hidden flex-shrink-0">
                            <img 
                              src={program.businessLogo}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/default-logo.png';
                              }}
                            />
                          </div>
                          {program.businessName}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-purple-100 block">Total Points</span>
                        <span className="text-xl font-bold text-white">{totalPoints}</span>
                      </div>
                      
                      <div>
                        <span className="text-sm text-purple-100 block">Available Rewards</span>
                        <span className="text-xl font-bold text-white">{availableRewards}</span>
                      </div>
                      
                      <Link 
                        to="/portal/cards"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors border border-white/30"
                      >
                        <span>View All Cards</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-6">
                  <p className="text-white text-lg mb-2">
                    You haven't joined any loyalty programs yet!
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Join a Program</h3>
                
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
                      <h3 className="font-medium text-white">Enter Membership Code</h3>
                      <p className="text-sm text-purple-100">Got a code from a business? Enter it to join their program</p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-white/70 group-hover:text-white" />
                  </button>
                </div>
                
                <Link 
                  to="/portal/discover"
                  className="block text-center mt-4 px-6 py-3 bg-white rounded-lg text-purple-700 font-medium hover:bg-purple-50 transition-colors"
                >
                  Discover Local Businesses
                </Link>
              </div>
            </div>
            
            <div className="md:col-span-5 flex items-center justify-center">
              {selectedProgram ? (
                <div className="relative transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-2xl"></div>
                  <div className="relative">
                    <CustomerLoyaltyCard
                      businessId={selectedProgram.businessId}
                      businessName={selectedProgram.businessName}
                      businessLogo={selectedProgram.businessLogo}
                      programId={selectedProgram.id}
                      programName={selectedProgram.programName}
                      pointsBalance={selectedProgram.pointsBalance}
                      rewardThreshold={selectedProgram.rewardThreshold}
                      rewardDescription={selectedProgram.rewardDescription}
                      customerName={user?.displayName || undefined}
                      customerId={user?.uid || undefined}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative transform hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-white/20 blur-xl rounded-2xl"></div>
                  <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white text-center w-80 relative">
                    <div className="mb-6">
                      <div className="w-20 h-20 mx-auto bg-white/30 rounded-full flex items-center justify-center">
                        <CreditCard className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Get Your First Card</h3>
                    <p className="text-purple-100 mb-4">Join a program to get your personalized loyalty card</p>
                    <button className="w-full bg-white text-purple-700 rounded-lg py-2 font-medium hover:bg-purple-50 transition-colors">
                      Join Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <ListChecks className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-blue-800">Active Programs</div>
              <div className="text-3xl font-bold text-blue-900">{totalPrograms}</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-purple-50 border-purple-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-purple-800">Total Points</div>
              <div className="text-3xl font-bold text-purple-900">{totalPoints}</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-green-800">Available Rewards</div>
              <div className="text-3xl font-bold text-green-900">{availableRewards}</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* Next Reward Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-900">Your Next Reward</h3>
          </div>
          
          <div className="p-4">
            {nextReward ? (
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mr-4">
                    <img 
                      src={nextReward.businessLogo}
                      alt={`${nextReward.businessName} logo`}
                      className="object-contain w-12 h-12"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/default-logo.png';
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h4 className="font-medium">{nextReward.businessName}</h4>
                  <p className="text-sm text-gray-600">{nextReward.programName}</p>
                  
                  <div className="mt-2 w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(nextReward.pointsBalance / nextReward.rewardThreshold) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-600">{nextReward.pointsBalance} points</span>
                    <span className="text-sm text-gray-600">{nextReward.rewardThreshold} points</span>
                  </div>
                  
                  <p className="text-sm mt-2">
                    <strong>{nextReward.rewardThreshold - nextReward.pointsBalance} more points</strong> until {nextReward.rewardDescription}
                  </p>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <Link 
                    to={`/portal/cards?business=${nextReward.businessId}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    View Card
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-6">
                <Award className="h-8 w-8 text-green-500 mr-3" />
                <span className="text-green-600 font-medium">All rewards available! Time to redeem.</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Programs Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Your Loyalty Programs</h3>
            <Link 
              to="/portal/programs"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-200">
            {SAMPLE_PROGRAMS.map(program => (
              <div 
                key={program.id} 
                className="p-4 flex items-center hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center mr-4">
                    <img 
                      src={program.businessLogo}
                      alt={`${program.businessName} logo`}
                      className="object-contain w-8 h-8"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/default-logo.png';
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium truncate">{program.businessName}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{program.pointsBalance} points</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {program.pointsBalance >= program.rewardThreshold 
                        ? 'Reward Available' 
                        : `${program.rewardThreshold - program.pointsBalance} until reward`}
                    </span>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Link 
                    to={`/portal/programs#${program.id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;