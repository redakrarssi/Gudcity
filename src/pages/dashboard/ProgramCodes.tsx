import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBusiness } from '../../hooks/useBusiness';
import PointCodeGenerator from '../../components/codes/PointCodeGenerator';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { LoyaltyProgram } from '../../contexts/BusinessContext';

const ProgramCodes: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const { business } = useBusiness();
  const [programName, setProgramName] = useState('Loyalty Program');
  
  // Get program information
  useEffect(() => {
    if (business?.programs && programId) {
      const program = business.programs.find(p => p.id === programId);
      if (program) {
        setProgramName(program.name);
      }
    }
  }, [business?.programs, programId]);
  
  if (!business) {
    return (
      <div className="text-center p-8">
        <p>You need to be logged in as a business to access this page.</p>
      </div>
    );
  }
  
  if (!programId) {
    return (
      <div className="text-center p-8">
        <p>No program ID specified.</p>
        <Link to="/dashboard/programs" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Programs
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Link to="/dashboard/programs" className="text-sm text-gray-600 hover:text-gray-900 flex items-center mb-3">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Programs
        </Link>
        
        <h1 className="text-2xl font-bold">Point Codes for {programName}</h1>
        <p className="text-gray-600 mt-1">
          Generate codes for customers to earn points or redeem rewards without scanning QR codes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium mb-3">About Point Codes</h2>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2">Point codes are a convenient way to award points or enable redemptions for your customers without requiring them to scan a QR code. They're perfect for:</p>
            
            <ul className="list-disc ml-5 space-y-1 mb-4">
              <li>Online orders where QR scanning isn't possible</li>
              <li>Promotional campaigns and marketing materials</li>
              <li>Compensating customers for issues or special situations</li>
              <li>Providing VIP customers with special rewards</li>
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-4 text-center border-t border-gray-200 pt-4">
              <div className="flex-1 p-3 bg-blue-50 rounded-md border border-blue-100">
                <h3 className="font-medium text-blue-800 mb-1">Earn Codes</h3>
                <p className="text-blue-600">Give customers points for purchases or promotions</p>
              </div>
              
              <div className="flex-1 p-3 bg-green-50 rounded-md border border-green-100">
                <h3 className="font-medium text-green-800 mb-1">Redeem Codes</h3>
                <p className="text-green-600">Allow customers to redeem rewards without visiting in person</p>
              </div>
            </div>
          </div>
        </div>
        
        <PointCodeGenerator 
          programId={programId}
          programName={programName}
        />
      </div>
    </div>
  );
};

export default ProgramCodes; 