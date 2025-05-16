import React, { useState, useEffect, ErrorInfo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { PlusCircle, Users, CreditCard, BadgeDollarSign, TrendingUp, QrCode, BarChart, ChevronRight, DollarSign, CalendarDays, ExternalLink, Settings, Gift, ShoppingBag, Star, X, CheckCircle, XCircle, Scan, ArrowRight } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CorrectQRScanner from '../../components/qr/CorrectQRScanner';
import { BusinessLoyaltyCard } from '../../components/cards';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

// Error boundary for the Dashboard
class DashboardErrorBoundary extends React.Component<
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
    console.error('Dashboard error:', error, errorInfo);
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

const Dashboard: React.FC = () => {
  const { business } = useBusiness();
  const { user } = useAuth();
  const [activityFeed, setActivityFeed] = useState<Array<{type: string; message: string; time: string}>>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  // Sample program data (in a real app, this would come from the database)
  const SAMPLE_PROGRAM = {
    id: 'prog-123',
    name: 'Loyalty Rewards',
    description: 'Earn points with every purchase, redeem for free products or services!',
    pointsPerPurchase: 10,
    rewardThreshold: 100,
    rewardDescription: 'Free product or service of your choice'
  };
  
  // Business info from context or user data
  const businessInfo = {
    id: business?.id || user?.businessId || 'mock-business-id',
    name: business?.name || user?.displayName || 'Your Business',
    logo: business?.logo || '/assets/default-logo.png',
    address: '123 Business Street, Cityville, BZ 12345',
    phone: '(555) 123-4567',
    email: 'contact@yourbusiness.com',
    description: 'Quality products and services for our valued customers'
  };
  
  useEffect(() => {
    // Mock activity feed data
    const mockActivityFeed = [
      { type: 'customer', message: 'New customer joined: Sarah Johnson', time: '2 hours ago' },
      { type: 'transaction', message: 'Purchase: John Doe earned 120 points', time: '4 hours ago' },
      { type: 'redemption', message: 'Reward redeemed: Free Coffee by Amy Smith', time: '1 day ago' },
      { type: 'customer', message: 'New customer joined: Mike Robinson', time: '2 days ago' },
      { type: 'transaction', message: 'Purchase: Lisa Wang earned 85 points', time: '3 days ago' },
    ];
    
    setActivityFeed(mockActivityFeed);
  }, []);

  // Handle QR scan success
  const handleQRScanSuccess = (result: { success: boolean; message: string; transaction?: any }) => {
    // Add the scan result to activity feed
    if (result.success) {
      const newActivity = {
        type: result.transaction?.type === 'earn' ? 'transaction' : 'redemption',
        message: result.message,
        time: 'Just now'
      };
      
      setActivityFeed([newActivity, ...activityFeed.slice(0, 4)]);
      
      // Show a toast or notification here
      console.log('QR code scanned successfully!', result.message);
    } else {
      // Show error notification
      console.error('QR scan failed:', result.message);
    }
    
    // Close scanner after a delay
    setTimeout(() => {
      setShowQRScanner(false);
    }, 3000);
  };

  // Dashboard UI
  return (
    <DashboardErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Overview of your loyalty program</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button 
              variant="secondary"
              onClick={() => setShowQRScanner(true)}
              className="flex items-center"
            >
              <Scan className="h-5 w-5 mr-2" />
              Scan QR Code
            </Button>
          </div>
        </div>

        {/* Business Loyalty Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm overflow-hidden p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Business Loyalty Card</h2>
                <p className="text-gray-600 text-sm">Share with your customers to join your program</p>
              </div>
              <Link 
                to="/dashboard/business-cards" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                View details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <BusinessLoyaltyCard
                business={businessInfo}
                programId={SAMPLE_PROGRAM.id}
                programName={SAMPLE_PROGRAM.name}
              />
              
              <Link 
                to="/dashboard/business-cards"
                className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage your loyalty cards
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {/* Loyalty Card Scanner Section */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg overflow-hidden p-6">
            <h2 className="text-xl font-bold text-white">Loyalty Program QR Scanner</h2>
            <p className="text-blue-100 mb-4">Scan customer QR codes to award or redeem points</p>
            
            <Button
              onClick={() => setShowQRScanner(true)}
              className="flex items-center bg-white/20 hover:bg-white/30 text-white border border-white/20"
            >
              <QrCode className="w-4 h-4 mr-2" />
              <span>Open QR Scanner</span>
            </Button>
          </div>
        </div>
        
        {/* Activity Feed */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {activityFeed.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className={`p-2 rounded-full mr-3 ${
                    activity.type === 'customer' ? 'bg-blue-100 text-blue-600' : 
                    activity.type === 'transaction' ? 'bg-green-100 text-green-600' : 
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'customer' ? <Users className="h-4 w-4" /> :
                     activity.type === 'transaction' ? <CreditCard className="h-4 w-4" /> :
                     <Gift className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* QR Scanner Modal */}
        {showQRScanner && (
          <CorrectQRScanner 
            isModal={true}
            onClose={() => setShowQRScanner(false)}
            onSuccess={handleQRScanSuccess}
          />
        )}
      </div>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;