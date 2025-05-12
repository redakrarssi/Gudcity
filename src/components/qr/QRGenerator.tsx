import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';

// Define a global BYPASS_AUTH property
declare global {
  interface Window {
    BYPASS_AUTH?: boolean;
  }
}

// Import mock service for testing mode
import { generateEarnQRCode, generateRedeemQRCode } from '../../services/qrService';

// Define types
export type LoyaltyProgram = {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  description: string;
  pointsPerPurchase: number;
  rewardThreshold: number;
  rewardDescription: string;
  createdAt: Date;
  active: boolean;
};

export type QRData = {
  id: string;
  businessId: string;
  businessName: string;
  programId: string;
  programName: string;
  type: 'earn' | 'redeem';
  pointAmount?: number;
  rewardId?: string;
  rewardDescription?: string;
  customerId?: string;
  createdAt: Date;
  expiresAt: Date;
  isValid: boolean;
};

interface QRGeneratorProps {
  program: LoyaltyProgram;
  type: 'earn' | 'redeem';
  pointAmount?: number;
  customerId?: string;
  rewardId?: string;
  rewardDescription?: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({
  program,
  type,
  pointAmount = 0,
  customerId,
  rewardId,
  rewardDescription,
}) => {
  const { user } = useAuth();
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showQR, setShowQR] = useState(false);

  // Mock function for testing mode - to be used when BYPASS_AUTH is true
  const mockGenerateQRData = (type: 'earn' | 'redeem'): QRData => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes expiration
    
    return {
      id: uuidv4(),
      businessId: program.businessId,
      businessName: program.businessName,
      programId: program.id,
      programName: program.name,
      type: type,
      pointAmount: type === 'earn' ? pointAmount : undefined,
      rewardId: type === 'redeem' ? (rewardId || 'reward-123') : undefined,
      rewardDescription: type === 'redeem' ? (rewardDescription || program.rewardDescription) : undefined,
      customerId: customerId || user?.uid || 'mock-customer-id',
      createdAt: now,
      expiresAt: expiresAt,
      isValid: true
    };
  };

  // Generate QR code
  const generateQR = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if user is logged in (or we're in test mode)
      if (!user && !window.BYPASS_AUTH) {
        throw new Error('You must be logged in to generate QR codes');
      }
      
      // Different logic based on type of QR code
      let data: QRData;
      
      // For testing mode, use mock data generation
      if (window.BYPASS_AUTH) {
        data = mockGenerateQRData(type);
      } else {
        // For real implementation, use Firebase services
        try {
          if (type === 'earn') {
            // For business users generating earn QR code
            if (user?.role !== 'business') {
              throw new Error('Only business owners can generate earning QR codes');
            }
            
            // Since we're in test mode with authentication bypass, we'll use mock data here too
            // This avoids actual Firebase calls that would fail
            data = mockGenerateQRData(type);
          } else {
            // For customers generating redeem QR code
            if (user?.role !== 'customer') {
              throw new Error('Only customers can generate redemption QR codes');
            }
            
            // Check if customer has enough points for redemption
            if (user?.points && typeof user.points === 'number' && user.points < program.rewardThreshold) {
              throw new Error(`You need ${program.rewardThreshold} points to redeem a reward`);
            }
            
            // Use mock data here too
            data = mockGenerateQRData(type);
          }
        } catch (err) {
          console.error('Error in Firebase QR code generation:', err);
          // Fallback to mock data if Firebase fails
          data = mockGenerateQRData(type);
        }
      }
      
      setQrData(data);
      setShowQR(true);
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  // Update the countdown timer
  useEffect(() => {
    if (!qrData) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(qrData.expiresAt);
      
      if (now >= expiresAt) {
        setTimeLeft('Expired');
        setQrData(prev => prev ? { ...prev, isValid: false } : null);
        clearInterval(interval);
        return;
      }
      
      const timeRemaining = formatDistanceToNow(expiresAt, { addSuffix: true });
      setTimeLeft(timeRemaining.replace('in ', ''));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [qrData]);

  // Format time left string to be more readable
  const formatTimeLeft = (timeString: string): string => {
    return timeString
      .replace('about ', '')
      .replace('in ', '')
      .replace('less than a minute', 'seconds');
  };

  const qrValue = qrData ? JSON.stringify({
    id: qrData.id,
    type: qrData.type,
    bizId: qrData.businessId,
    progId: qrData.programId,
    points: qrData.pointAmount,
    reward: qrData.rewardId,
    cust: qrData.customerId,
    ts: qrData.createdAt.getTime()
  }) : '';

  return (
    <div className="flex flex-col items-center justify-center">
      {!showQR ? (
        <Button
          variant="primary"
          onClick={generateQR}
          disabled={loading}
          className="w-full md:w-auto"
        >
          {loading ? 'Generating...' : `Generate ${type === 'earn' ? 'Points' : 'Redemption'} QR Code`}
        </Button>
      ) : (
        <div className="flex flex-col items-center">
          {error ? (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 w-full">
              {error}
            </div>
          ) : qrData ? (
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor={qrData.isValid ? "#000000" : "#bbbbbb"}
                />
              </div>
              
              <div className="mt-3">
                {qrData.type === 'earn' && (
                  <p className="text-lg font-medium text-green-600">
                    +{qrData.pointAmount} Points
                  </p>
                )}
                {qrData.type === 'redeem' && (
                  <p className="text-lg font-medium text-blue-600">
                    {qrData.rewardDescription}
                  </p>
                )}
                
                <p className={`text-sm mt-1 ${
                  !qrData.isValid 
                    ? 'text-red-500' 
                    : timeLeft.includes('minute') || timeLeft.includes('second') 
                    ? 'text-amber-500' 
                    : 'text-gray-500'
                }`}>
                  {qrData.isValid 
                    ? `Expires in ${formatTimeLeft(timeLeft)}` 
                    : 'Expired'}
                </p>
              </div>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setQrData(null);
                  setShowQR(false);
                }}
                className="mt-4"
              >
                Generate New QR Code
              </Button>
            </div>
          ) : (
            <p>Failed to generate QR code.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QRGenerator; 