import React, { useState, ErrorInfo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { ListChecks, CreditCard, Gift, ChevronRight, Award, ArrowRight, ExternalLink, PlusCircle, QrCode, Scan } from 'lucide-react';
import { CustomerLoyaltyCard } from '../../components/cards';
import CorrectQRScanner from '../../components/qr/CorrectQRScanner';
import Button from '../../components/ui/Button';

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

// Error boundary for the Customer Portal
class CustomerPortalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CustomerPortal error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-medium text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const CustomerPortal: React.FC = () => {
  const { user } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState(SAMPLE_PROGRAMS[0]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
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
  
  // Handle QR scan success
  const handleQRScanSuccess = (result: { success: boolean; message: string }) => {
    // Add feedback for the user
    if (result.success) {
      console.log('QR code scanned successfully!', result.message);
      
      // In a real app, we would update the UI to show the joined program
      // or display a notification about the points claimed
    } else {
      console.error('QR scan failed:', result.message);
    }
    
    // Close scanner after a delay
    setTimeout(() => {
      setShowQRScanner(false);
    }, 3000);
  };
  
  return (
    <CustomerPortalErrorBoundary>
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
                    <button 
                      className="flex items-center bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/20 transition-all group"
                      onClick={() => setShowQRScanner(true)}
                    >
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
        
        {/* Rewards Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Rewards Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm overflow-hidden p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">My Rewards</h2>
                <p className="text-gray-600 text-sm">Redeem rewards from your loyalty programs</p>
              </div>
              <Link 
                to="/portal/rewards" 
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center"
              >
                View all rewards
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {availableRewards > 0 ? (
                SAMPLE_PROGRAMS.filter(program => program.pointsBalance >= program.rewardThreshold)
                  .map(program => (
                    <div key={program.id} className="bg-white rounded-lg shadow-sm p-4 border border-green-100 flex items-start">
                      <div className="p-3 rounded-full bg-green-100 mr-3 flex-shrink-0">
                        <Gift className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{program.businessName}</h3>
                        <p className="text-sm text-gray-600">{program.rewardDescription}</p>
                        <div className="mt-2 flex items-center">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Reward Available
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="success" 
                        size="sm"
                        className="flex-shrink-0 ml-2"
                      >
                        Redeem
                      </Button>
                    </div>
                  ))
              ) : (
                <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-gray-100">
                      <Gift className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-800">No Rewards Available Yet</h3>
                  <p className="text-sm text-gray-600 mt-1">Keep earning points to unlock rewards</p>
                </div>
              )}
              
              <Link 
                to="/portal/rewards"
                className="block text-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Manage My Rewards
              </Link>
            </div>
          </div>
          
          {/* QR Code Card to Receive Points */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-xl font-bold text-white">Quick Points</h2>
            <p className="text-blue-100 mb-4">Scan or show your QR code to earn points at participating businesses</p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <QrCode className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Show Your QR Code</h3>
                  <p className="text-xs text-blue-100">Let the business scan your code to award points</p>
                </div>
              </div>
              
              {selectedProgram && (
                <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                  <p className="text-sm text-gray-700 mb-2">Quick access to your active card</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowQRScanner(false)}
                    className="w-full"
                  >
                    Show {selectedProgram.businessName} Card
                  </Button>
                </div>
              )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Scan className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Scan Business QR Code</h3>
                  <p className="text-xs text-blue-100">Scan a business QR code to join or earn points</p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowQRScanner(true)}
                className="w-full bg-white text-indigo-700 hover:bg-blue-50"
              >
                <QrCode className="w-4 h-4 mr-2" />
                <span>Open QR Scanner</span>
              </Button>
            </div>
          </div>
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
        
        {/* QR Scanner Modal */}
        {showQRScanner && (
          <CorrectQRScanner 
            isModal={true}
            onClose={() => setShowQRScanner(false)}
            onSuccess={handleQRScanSuccess}
          />
        )}
      </div>
    </CustomerPortalErrorBoundary>
  );
};

export default CustomerPortal;