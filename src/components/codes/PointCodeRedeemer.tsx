import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { processPointCode } from '../../services/codeService';
import Button from '../ui/Button';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PointCodeRedeemerProps {
  onSuccess?: (pointAmount: number) => void;
}

const PointCodeRedeemer: React.FC<PointCodeRedeemerProps> = ({
  onSuccess
}) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Format the code input (uppercase, remove spaces)
  const formatCode = (input: string) => {
    return input.toUpperCase().replace(/\s+/g, '');
  };

  // Handle code input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCode = formatCode(e.target.value);
    setCode(formattedCode);
  };

  // Process the code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter a code');
      return;
    }
    
    if (!user?.uid) {
      setError('You must be logged in to redeem codes');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await processPointCode(code, user.uid);
      
      if (result.success) {
        setSuccess(result.message);
        setCode('');
        
        // Call the success callback if provided
        if (onSuccess && result.pointCode) {
          onSuccess(result.pointCode.pointAmount);
        }
      } else {
        setError(result.message);
      }
      
    } catch (err) {
      setError('Failed to process code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">Redeem a Code</h2>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>{success}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your loyalty code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={handleCodeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter code (e.g. ABC12345)"
            disabled={loading}
            autoComplete="off"
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !code.trim() || !user?.uid}
          className="w-full"
        >
          {loading ? 'Processing...' : 'Redeem Code'}
        </Button>
      </form>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Codes can be used to:</p>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Earn points from promotional offers</li>
          <li>Redeem rewards without visiting a store</li>
          <li>Claim special bonuses and limited-time offers</li>
        </ul>
      </div>
    </div>
  );
};

export default PointCodeRedeemer; 