import React, { useState, useEffect } from 'react';
import { BusinessLoyaltyCard } from '../../components/cards';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Printer, Download, Share2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { processPointCode } from '../../services/codeService';

// Sample program data (in a real app, this would come from the database)
const SAMPLE_PROGRAM = {
  id: 'prog-123',
  name: 'Loyalty Rewards',
  description: 'Earn points with every purchase, redeem for free products or services!',
  pointsPerPurchase: 10,
  rewardThreshold: 100,
  rewardDescription: 'Free product or service of your choice'
};

const BusinessCardsPage: React.FC = () => {
  const { user } = useAuth();
  const { business } = useBusiness();
  const [showTips, setShowTips] = useState(true);
  const navigate = useNavigate();
  
  // In a real app, you would fetch the business's loyalty programs
  const [programs] = useState([SAMPLE_PROGRAM]);
  
  // State for code redemption
  const [redemptionCode, setRedemptionCode] = useState('');
  const [redemptionStatus, setRedemptionStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
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

  // Functions to handle printing and sharing
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    alert('This would download a PDF of your loyalty card');
  };
  
  const handleShare = () => {
    // In a real implementation, this would open a share dialog
    alert('This would share your loyalty card with customers');
  };

  const handleEditProgram = () => {
    navigate('/dashboard/programs');
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Business Loyalty Cards</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownload}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
          <Button 
            variant="primary" 
            onClick={handleShare}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
      
      {showTips && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-blue-800">Loyalty Card Tips</h3>
              <ul className="mt-2 list-disc list-inside text-blue-700 space-y-1 text-sm">
                <li>Print and display your loyalty card at your business</li>
                <li>Share the QR code on social media to attract new customers</li>
                <li>Customers can scan the QR code to join your loyalty program</li>
                <li>Once joined, customers get their own card for earning points</li>
              </ul>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowTips(false)}
              className="text-blue-700"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Business Card</h2>
          <p className="text-sm text-gray-600 mb-4">
            This is the card customers will see when they join your loyalty program
          </p>
          <BusinessLoyaltyCard
            business={businessInfo}
            programId={programs[0].id}
            programName={programs[0].name}
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">How It Works</h2>
            <Card>
              <h3 className="font-medium mb-2">For Your Business:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm">
                <li>Display your loyalty card with QR code in-store</li>
                <li>Customers scan the QR code to join your program</li>
                <li>When a customer makes a purchase, scan their loyalty card</li>
                <li>Award points based on their purchase</li>
                <li>The system tracks points and notifies when customers reach rewards</li>
              </ol>
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Program Settings</h2>
            <Card>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Program Name:</span>
                  <p className="text-sm">{programs[0].name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Points Per Purchase:</span>
                  <p className="text-sm">{programs[0].pointsPerPurchase} points</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Reward Threshold:</span>
                  <p className="text-sm">{programs[0].rewardThreshold} points</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Reward:</span>
                  <p className="text-sm">{programs[0].rewardDescription}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleEditProgram}
                >
                  Edit Program Settings
                </Button>
              </div>
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Redemption Tool</h2>
            <Card>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
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
                      size="sm"
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
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardsPage; 