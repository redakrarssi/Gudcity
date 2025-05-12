import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../hooks/useAuth';

interface BusinessLoyaltyCardProps {
  business?: {
    id: string;
    name: string;
    logo?: string;
    address: string;
    phone: string;
    email: string;
    description: string;
  };
  programId: string;
  programName: string;
}

const BusinessLoyaltyCard: React.FC<BusinessLoyaltyCardProps> = ({
  business,
  programId,
  programName
}) => {
  const { user } = useAuth();
  const [showQR, setShowQR] = useState(false);
  
  // Use current business info from auth or the passed business prop
  const businessInfo = business || {
    id: user?.businessId || 'mock-business-id',
    name: user?.displayName || 'Sample Business',
    logo: '/assets/default-logo.png',
    address: '123 Main St, Anytown, USA',
    phone: '(555) 123-4567',
    email: 'contact@samplebusiness.com',
    description: 'We provide quality products and services.'
  };
  
  // QR code data for joining the loyalty program
  const generateJoinQRData = () => {
    return JSON.stringify({
      type: 'join',
      bizId: businessInfo.id,
      progId: programId,
      progName: programName,
      bizName: businessInfo.name,
      ts: new Date().getTime(),
      code: uuidv4()
    });
  };

  return (
    <Card 
      className="max-w-sm mx-auto overflow-hidden" 
      title={businessInfo.name}
      subtitle="Loyalty Program"
    >
      <div className="flex flex-col items-center">
        {businessInfo.logo && (
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
            <img 
              src={businessInfo.logo} 
              alt={`${businessInfo.name} logo`} 
              className="object-contain w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/default-logo.png';
              }}
            />
          </div>
        )}
        
        <div className="w-full text-sm text-gray-600 mb-4">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="font-medium">Program:</span> 
            <span>{programName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="font-medium">Address:</span> 
            <span>{businessInfo.address}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="font-medium">Phone:</span> 
            <span>{businessInfo.phone}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="font-medium">Email:</span> 
            <span>{businessInfo.email}</span>
          </div>
        </div>
        
        {showQR ? (
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <QRCodeSVG
              value={generateJoinQRData()}
              size={180}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#000000"
            />
            <p className="text-xs text-center mt-2 text-gray-500">
              Scan to join our loyalty program
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
            Show Membership QR
          </Button>
        )}
        
        <p className="mt-4 text-xs text-gray-500 text-center">
          {businessInfo.description}
        </p>
      </div>
    </Card>
  );
};

export default BusinessLoyaltyCard; 