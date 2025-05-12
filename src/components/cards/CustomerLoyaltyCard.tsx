import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../hooks/useAuth';

interface CustomerLoyaltyCardProps {
  businessId: string;
  businessName: string;
  businessLogo?: string;
  programId: string;
  programName: string;
  pointsBalance: number;
  rewardThreshold: number;
  rewardDescription: string;
  customerName?: string;
  customerId?: string;
}

const CustomerLoyaltyCard: React.FC<CustomerLoyaltyCardProps> = ({
  businessId,
  businessName,
  businessLogo,
  programId,
  programName,
  pointsBalance,
  rewardThreshold,
  rewardDescription,
  customerName,
  customerId
}) => {
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);
  
  // Use current user info from auth context or the passed props
  const customerInfo = {
    id: customerId || user?.uid || 'mock-customer-id',
    name: customerName || user?.displayName || 'Loyal Customer'
  };
  
  // Progress towards reward
  const progressPercentage = Math.min(
    Math.round((pointsBalance / rewardThreshold) * 100),
    100
  );
  
  // QR code data for getting points
  const generateEarnQRData = () => {
    return JSON.stringify({
      type: 'earn',
      bizId: businessId,
      progId: programId,
      custId: customerInfo.id,
      custName: customerInfo.name,
      ts: new Date().getTime(),
      code: uuidv4()
    });
  };

  return (
    <Card 
      className="max-w-sm mx-auto overflow-hidden" 
      title={businessName}
      subtitle={programName}
    >
      <div className="flex flex-col items-center">
        {businessLogo && (
          <div className="w-16 h-16 rounded-full overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
            <img 
              src={businessLogo} 
              alt={`${businessName} logo`} 
              className="object-contain w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/default-logo.png';
              }}
            />
          </div>
        )}
        
        <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
          <div 
            className="bg-primary h-4 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between w-full text-sm mb-4">
          <span>
            <span className="font-bold text-primary text-lg">{pointsBalance}</span> pts
          </span>
          <span className="text-gray-600">
            Reward at <span className="font-bold">{rewardThreshold}</span> pts
          </span>
        </div>
        
        <div className="border-t border-b border-gray-200 py-3 mb-4 w-full">
          <p className="text-sm text-center">
            <strong>Next Reward:</strong> {rewardDescription}
          </p>
        </div>
        
        {showQR ? (
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <QRCodeSVG
              value={generateEarnQRData()}
              size={180}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
            <p className="text-xs text-center mt-2 text-gray-500">
              Let the business scan to award points
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowQR(false)}
              className="mt-3 w-full"
            >
              Hide QR Code
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={() => setShowQR(true)}
            className="w-full"
          >
            Show Points QR
          </Button>
        )}
        
        <p className="mt-4 text-sm text-gray-600 text-center">
          {customerInfo.name} • Member since {new Date().toLocaleDateString()}
        </p>
      </div>
    </Card>
  );
};

export default CustomerLoyaltyCard; 