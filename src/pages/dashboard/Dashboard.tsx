import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { PlusCircle, Users, CreditCard, BadgeDollarSign, TrendingUp, QrCode, BarChart, ChevronRight, DollarSign, CalendarDays, ExternalLink, Settings, Gift, ShoppingBag, Star, X, CheckCircle, XCircle } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { processPointCode } from '../../services/codeService';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import QRGenerator from '../../components/qr/QRGenerator';
import { BusinessLoyaltyCard } from '../../components/cards';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { business } = useBusiness();
  const { user } = useAuth();
  const location = useLocation();
  const [activityFeed, setActivityFeed] = useState<Array<{type: string; message: string; time: string}>>([]);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState(50);
  
  // State for code redemption
  const [redemptionCode, setRedemptionCode] = useState('');
  const [redemptionStatus, setRedemptionStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Determine if we're in the customer portal
  const isCustomerPortal = location.pathname === '/portal' || location.pathname.startsWith('/portal/');

  // Sample program for QR code generation
  const sampleProgram = {
    id: "program-1",
    businessId: "mock-business-id",
    businessName: "GudCity Coffee",
    name: "GudPoints",
    description: "Earn points with every purchase and redeem for rewards",
    pointsPerPurchase: 10,
    rewardThreshold: 200,
    rewardDescription: "Free Coffee",
    createdAt: new Date(),
    active: true
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

  // Function to select points amount for QR generation
  const selectPoints = (points: number) => {
    setSelectedPoints(points);
  };

  // Customer transactions for personal dashboard
  const customerTransactions = [
    { id: '1', business: 'CoffeeShop', date: '2023-08-01', points: 25, type: 'earn', description: 'Purchase: Coffee & Bagel' },
    { id: '2', business: 'BookStore', date: '2023-07-28', points: 50, type: 'earn', description: 'Purchase: Books' },
    { id: '3', business: 'CoffeeShop', date: '2023-07-25', points: 100, type: 'redeem', description: 'Redeemed: Free Lunch Special' },
    { id: '4', business: 'Restaurant', date: '2023-07-20', points: 75, type: 'earn', description: 'Purchase: Dinner for two' },
    { id: '5', business: 'GroceryStore', date: '2023-07-15', points: 30, type: 'earn', description: 'Purchase: Weekly groceries' },
  ];

  // Customer cards/programs for personal dashboard
  const customerCards = [
    { id: 'card1', business: 'CoffeeShop', programName: 'Coffee Club', points: 175, nextReward: 'Free Coffee', pointsNeeded: 25 },
    { id: 'card2', business: 'BookStore', programName: 'Reader Rewards', points: 150, nextReward: 'Book Discount', pointsNeeded: 50 },
    { id: 'card3', business: 'Restaurant', programName: 'Dining Delights', points: 100, nextReward: 'Free Appetizer', pointsNeeded: 50 },
  ];

  // Available rewards for customer
  const availableRewards = [
    { id: 'reward1', business: 'CoffeeShop', name: 'Free Coffee', pointsRequired: 200, expires: '2023-12-31' },
    { id: 'reward2', business: 'BookStore', name: '20% Off Next Purchase', pointsRequired: 200, expires: '2023-11-30' },
    { id: 'reward3', business: 'Restaurant', name: 'Free Dessert', pointsRequired: 150, expires: '2023-12-15' },
  ];

  // Mock chart data
  const pointsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Points Issued',
        data: [1200, 1900, 1500, 2500, 2200, 3000],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Points Redeemed',
        data: [900, 1200, 1100, 1700, 1800, 2100],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
    ],
  };

  const customerChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Customers',
        data: [25, 35, 40, 50, 65, 75],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Active Customers',
        data: [20, 25, 30, 45, 55, 70],
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const programDistribution = {
    labels: ['Points Program', 'Punch Card', 'VIP Tiers'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Customer points chart
  const customerPointsChart = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Points Earned',
        data: [50, 120, 80, 150, 100, 200],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Points Redeemed',
        data: [0, 0, 100, 0, 50, 100],
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Mock data for the dashboard
  const SAMPLE_PROGRAM = {
    id: 'prog-123',
    name: 'Loyalty Rewards',
    description: 'Earn points with every purchase, redeem for free products or services!',
    pointsPerPurchase: 10,
    rewardThreshold: 100,
    rewardDescription: 'Free product or service of your choice'
  };

  // Mock data for charts
  const mockActivityData = [
    { date: 'Mon', transactions: 12, points: 120 },
    { date: 'Tue', transactions: 8, points: 80 },
    { date: 'Wed', transactions: 15, points: 150 },
    { date: 'Thu', transactions: 10, points: 100 },
    { date: 'Fri', transactions: 20, points: 200 },
    { date: 'Sat', transactions: 25, points: 250 },
    { date: 'Sun', transactions: 18, points: 180 },
  ];

  // Mock data for recent transactions
  const mockTransactions = [
    { id: '1', customer: 'John Doe', date: '2023-08-01', points: 50, type: 'earn' },
    { id: '2', customer: 'Jane Smith', date: '2023-08-01', points: 100, type: 'earn' },
    { id: '3', customer: 'Bob Johnson', date: '2023-07-31', points: 200, type: 'redeem' },
    { id: '4', customer: 'Alice Williams', date: '2023-07-30', points: 25, type: 'earn' },
    { id: '5', customer: 'Charlie Brown', date: '2023-07-30', points: 75, type: 'earn' },
  ];

  // Calculate metrics
  const totalPoints = mockTransactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.points, 0);
  
  const totalRedeemed = mockTransactions
    .filter(t => t.type === 'redeem')
    .reduce((sum, t) => sum + t.points, 0);
  
  const totalCustomers = 125; // Mock data
  const totalRevenue = 12450; // Mock data in dollars
  
  // Business info from context or user data
  const businessInfo = {
    id: business?.id || 'mock-business-id',
    name: business?.name || 'Your Business',
    logo: business?.logo || '/assets/default-logo.png',
    address: '123 Business Street, Cityville, BZ 12345',
    phone: '(555) 123-4567',
    email: 'contact@yourbusiness.com',
    description: 'Quality products and services for our valued customers'
  };

  // Function to process redemption code
  const handleRedeemCode = async () => {
    if (!redemptionCode.trim()) {
      setRedemptionStatus({
        success: false,
        message: 'Please enter a valid redemption code.'
      });
      return;
    }
    
    setIsProcessing(true);
    setRedemptionStatus({});
    
    try {
      // In a real app, we would use the business ID from context/state
      const businessId = businessInfo.id;
      // For demo purposes, use a mock user ID since we're in the business view
      const userId = user?.uid || 'mock-business-id';
      
      const result = await processPointCode(redemptionCode, userId);
      
      setRedemptionStatus({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        // Clear the input after successful redemption
        setRedemptionCode('');
      }
    } catch (error) {
      console.error('Error processing redemption code:', error);
      setRedemptionStatus({
        success: false,
        message: 'An error occurred while processing the code.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Render customer dashboard
  if (user?.role === 'customer' || location.pathname === '/portal' || location.pathname.startsWith('/portal/')) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="mt-1 text-sm text-gray-500">Track your loyalty rewards and points</p>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-2 flex items-center">
            <Gift className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium text-blue-700">{user?.points || 175} Points Available</span>
          </div>
        </div>

        {/* QR Code for scanning */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Scan this code at CoffeeShop</h3>
            <div className="flex justify-center mb-4">
              <div className="bg-white p-3 rounded-lg border-2 border-gray-200">
                <QRGenerator 
                  program={sampleProgram.id}
                  business={sampleProgram.businessId}
                  customer="customer-12345"
                  size={200}
                />
              </div>
            </div>
            <div className="text-center text-sm text-gray-500 mb-2">
              Present this QR code whenever you visit CoffeeShop to earn and redeem points
            </div>
            <div className="flex justify-center mt-4">
              <div className="bg-blue-50 rounded-lg px-4 py-2 inline-flex items-center">
                <BadgeDollarSign className="h-5 w-5 text-blue-500 mr-2" />
                <span>You have 175 points (25 more needed for a free coffee)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity - specific to current business */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity at CoffeeShop</h2>
            <Link to="/portal/transactions" className="text-sm text-blue-600 flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerTransactions.filter(t => t.business === 'CoffeeShop').map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center ${
                          transaction.type === 'earn' ? 'text-green-700' : 'text-red-600'
                        }`}>
                          {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Points History Chart */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">My Points History</h2>
          <Card className="p-4">
            <div className="h-64">
              <Bar 
                data={customerPointsChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Render business dashboard (original)
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of your loyalty program performance</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant="secondary"
            leftIcon={<QrCode className="h-5 w-5" />}
            onClick={() => setShowQRGenerator(!showQRGenerator)}
          >
            {showQRGenerator ? 'Hide QR Generator' : 'Generate QR Code'}
          </Button>
          <Link to="/dashboard/programs">
            <Button 
              variant="primary"
              leftIcon={<PlusCircle className="h-5 w-5" />}
            >
              Create Program
            </Button>
          </Link>
        </div>
      </div>

      {/* Loyalty Card Widget */}
      <div className="rounded-xl shadow-md overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 text-white">
              <h2 className="text-2xl font-bold mb-2">Your Loyalty Card</h2>
              <p className="text-blue-100 mb-4">
                Share this card with customers to promote your loyalty program
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20">
                <h3 className="font-medium mb-2 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Program Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-100">Program Name</p>
                    <p className="font-medium">{SAMPLE_PROGRAM.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Points Per Purchase</p>
                    <p className="font-medium">{SAMPLE_PROGRAM.pointsPerPurchase} points</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Reward Threshold</p>
                    <p className="font-medium">{SAMPLE_PROGRAM.rewardThreshold} points</p>
                  </div>
                  <div>
                    <p className="text-blue-100">Reward</p>
                    <p className="font-medium">{SAMPLE_PROGRAM.rewardDescription}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/dashboard/cards">
                  <Button variant="outline" className="text-sm">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Card
                  </Button>
                </Link>
                <Link to="/dashboard/programs">
                  <Button variant="outline" className="text-sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Program
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md">
                <BusinessLoyaltyCard 
                  business={{
                    id: businessInfo.id,
                    name: businessInfo.name,
                    logo: businessInfo.logo || undefined,
                    address: '123 Business St, City, State',
                    phone: '(555) 123-4567',
                    email: 'business@example.com',
                    description: 'Your business description'
                  }}
                  programId={SAMPLE_PROGRAM.id}
                  programName={SAMPLE_PROGRAM.name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redemption Tool */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Redemption Tool</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Enter a customer's redemption code to verify and process their reward.
            </p>
            <div className="flex flex-col space-y-2">
              <label htmlFor="redemptionCode" className="text-sm font-medium text-gray-700">
                Redemption Code
              </label>
              <div className="flex space-x-2">
                <input
                  id="redemptionCode"
                  type="text"
                  value={redemptionCode}
                  onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g., ABCD1234)"
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <Button
                  variant="primary"
                  onClick={handleRedeemCode}
                  disabled={isProcessing || !redemptionCode.trim()}
                  className="whitespace-nowrap"
                >
                  {isProcessing ? 'Processing...' : 'Verify & Redeem'}
                </Button>
              </div>
            </div>
            
            {redemptionStatus.message && (
              <div className={`flex items-center p-3 rounded-md ${
                redemptionStatus.success 
                  ? 'bg-green-50 text-green-700 border border-green-100' 
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {redemptionStatus.success ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 text-red-500" />
                )}
                <span className="text-sm">{redemptionStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* QR Generator modal */}
      {showQRGenerator && (
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Generate Points QR Code</h3>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0" 
                onClick={() => setShowQRGenerator(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Points
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((points) => (
                      <button
                        key={points}
                        type="button"
                        onClick={() => selectPoints(points)}
                        className={`py-2 px-4 text-sm font-medium rounded-md ${
                          selectedPoints === points
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {points} Points
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program
                  </label>
                  <div className="rounded-md border border-gray-300 px-4 py-3 bg-gray-50">
                    <div className="font-medium">{sampleProgram.name}</div>
                    <div className="text-sm text-gray-500">{sampleProgram.businessName}</div>
                  </div>
                </div>
                
                <div>
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => {
                      // Handle QR code generation or download
                      // Instead of just showing an alert, we need to actually generate a QR code
                      // This is a temporary implementation and should be replaced with actual functionality
                      const qrContainer = document.querySelector('.business-qr-container');
                      
                      if (qrContainer) {
                        const svgElement = qrContainer.querySelector('svg');
                        if (svgElement) {
                          // Convert SVG to data URI
                          const svgData = new XMLSerializer().serializeToString(svgElement);
                          const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
                          const svgUrl = URL.createObjectURL(svgBlob);
                          
                          // Create download link
                          const downloadLink = document.createElement('a');
                          downloadLink.href = svgUrl;
                          downloadLink.download = `gudpoints-${selectedPoints}-points.svg`;
                          document.body.appendChild(downloadLink);
                          downloadLink.click();
                          document.body.removeChild(downloadLink);
                          
                          // Cleanup
                          URL.revokeObjectURL(svgUrl);
                          
                          // Show success message
                          alert(`QR code for ${selectedPoints} points downloaded!`);
                        }
                      }
                    }}
                  >
                    Download QR Code
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center business-qr-container">
                <QRGenerator 
                  program={{
                    id: sampleProgram.id,
                    businessId: sampleProgram.businessId,
                    businessName: sampleProgram.businessName,
                    name: sampleProgram.name,
                    description: sampleProgram.description,
                    pointsPerPurchase: sampleProgram.pointsPerPurchase,
                    rewardThreshold: sampleProgram.rewardThreshold,
                    rewardDescription: sampleProgram.rewardDescription,
                    createdAt: new Date(),
                    active: true
                  }}
                  type="earn"
                  pointAmount={selectedPoints}
                />
                <div className="text-center mt-4">
                  <div className="font-medium">{selectedPoints} Points</div>
                  <p className="text-sm text-gray-500">Scan to award points to customer</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                <BadgeDollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Points Issued</h3>
                <span className="text-xl font-semibold text-gray-900">{totalPoints}</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center">
                <Gift className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Points Redeemed</h3>
                <span className="text-xl font-semibold text-gray-900">{totalRedeemed}</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
                <span className="text-xl font-semibold text-gray-900">{totalCustomers}</span>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                <span className="text-xl font-semibold text-gray-900">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* More business dashboard content would go here */}
    </div>
  );
};

export default Dashboard;