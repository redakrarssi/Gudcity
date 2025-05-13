import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TestQR: React.FC = () => {
  // Example QR code data
  const testQRData = [
    {
      type: 'business',
      id: 'test-business-123',
      name: 'Test Coffee Shop',
      description: 'Join our loyalty program and earn rewards with every purchase!'
    },
    {
      type: 'earn',
      businessId: 'test-business-123',
      programId: 'coffee-rewards',
      pointsToEarn: 50,
      description: 'Earn 50 points for your purchase'
    },
    {
      type: 'redeem',
      businessId: 'test-business-123',
      programId: 'coffee-rewards',
      customerId: 'test-customer-456',
      pointsToRedeem: 100,
      description: 'Redeem 100 points for a free coffee'
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8">Test QR Codes</h1>
      <p className="text-gray-600 mb-8">Use these QR codes to test the scanner functionality in your app. Scan them with the QR scanner in the dashboard or customer portal.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testQRData.map((data, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3 capitalize">
              {data.type} QR Code
            </h2>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                <QRCodeSVG 
                  value={JSON.stringify(data)}
                  size={200}
                  level="H" // High error correction
                  includeMargin={true}
                />
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">{data.description}</p>
              <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto">
                {JSON.stringify(data, null, 2)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-lg font-medium text-blue-800 mb-2">How to Use These QR Codes</h3>
        <ol className="list-decimal ml-5 text-blue-700 space-y-2">
          <li>Go to the dashboard or customer portal</li>
          <li>Click on "Scan QR Code" button</li>
          <li>Point your camera at one of these QR codes</li>
          <li>The scanner should detect the code and process it</li>
          <li>Check the result message to see if it worked</li>
        </ol>
      </div>
    </div>
  );
};

export default TestQR; 