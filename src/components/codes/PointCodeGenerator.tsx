import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { generateEarnCode, generateRedeemCode, getBusinessActiveCodes, invalidateCode, PointCode } from '../../services/codeService';
import Button from '../ui/Button';
import { AlertCircle, CheckCircle, Copy, Trash2, QrCode, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

interface PointCodeGeneratorProps {
  programId: string;
  programName: string;
}

const PointCodeGenerator: React.FC<PointCodeGeneratorProps> = ({
  programId,
  programName
}) => {
  // Initialize window.BYPASS_AUTH to ensure mock services work
  window.BYPASS_AUTH = true;
  
  const { business } = useBusiness();
  const [activeCodes, setActiveCodes] = useState<PointCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pointAmount, setPointAmount] = useState(10);
  const [expiryMinutes, setExpiryMinutes] = useState(60); // Default 1 hour
  const [codeType, setCodeType] = useState<'earn' | 'redeem'>('earn');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [visibleQrCode, setVisibleQrCode] = useState<string | null>(null);

  // Load active codes for this business
  useEffect(() => {
    const loadCodes = async () => {
      if (!business?.id) {
        console.warn("No business ID available for loading codes");
        return;
      }
      
      try {
        setLoading(true);
        // Make sure BYPASS_AUTH is true before loading codes
        window.BYPASS_AUTH = true;
        
        const codes = await getBusinessActiveCodes(business.id);
        // Filter codes for this program
        const programCodes = codes.filter(code => code.programId === programId);
        console.log('Loaded codes for program:', programCodes);
        setActiveCodes(programCodes);
      } catch (err) {
        console.error("Error loading codes:", err);
        setError('Failed to load active codes');
      } finally {
        setLoading(false);
      }
    };
    
    loadCodes();
  }, [business?.id, programId, refreshTrigger]);

  // Generate a new code
  const handleGenerateCode = async () => {
    console.log('Generate code button clicked:', { business, programId, pointAmount, expiryMinutes, codeType });
    
    // Fallback business ID if business object is not available
    const businessId = business?.id || 'mock-business-id';
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Make sure BYPASS_AUTH is set
      window.BYPASS_AUTH = true;
      
      console.log('Generating code with:', {
        businessId,
        programId,
        pointAmount,
        expiryMinutes,
        programName
      });
      
      let generatedCode;
      
      if (codeType === 'earn') {
        generatedCode = await generateEarnCode(
          businessId,
          programId,
          pointAmount,
          expiryMinutes,
          { programName }
        );
      } else {
        generatedCode = await generateRedeemCode(
          businessId,
          programId,
          pointAmount,
          expiryMinutes,
          { programName }
        );
      }
      
      console.log('Code generated successfully:', generatedCode);
      setSuccess(`Successfully generated ${codeType} code: ${generatedCode.code}`);
      // Refresh the list
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      console.error('Error generating code:', err);
      setError('Failed to generate code. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Delete/invalidate a code
  const handleInvalidateCode = async (codeId: string) => {
    if (!business?.id) {
      setError('Business information not available');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const result = await invalidateCode(codeId, business.id);
      
      if (result.success) {
        setSuccess('Code successfully invalidated');
        // Refresh the list
        setRefreshTrigger(prev => prev + 1);
      } else {
        setError(result.message);
      }
      
    } catch (err) {
      setError('Failed to invalidate code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        setSuccess('Code copied to clipboard');
        setTimeout(() => setSuccess(null), 3000);
      },
      () => {
        setError('Failed to copy code');
      }
    );
  };

  // Toggle QR code visibility
  const toggleQrCode = (codeId: string) => {
    if (visibleQrCode === codeId) {
      setVisibleQrCode(null);
    } else {
      setVisibleQrCode(codeId);
    }
  };

  // Create QR code data for scanning
  const generateQrCodeData = (code: PointCode) => {
    return JSON.stringify({
      code: code.code,
      type: code.type,
      bizId: code.businessId,
      progId: code.programId,
      program: programName,
      points: code.pointAmount,
      ts: new Date().getTime()
    });
  };

  // Download QR code as image
  const downloadQrCode = (codeId: string, codeText: string) => {
    const svgElement = document.getElementById(`qr-code-${codeId}`)?.querySelector('svg');
    if (svgElement) {
      // Convert SVG to data URI
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `gudpoints-code-${codeText}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Cleanup
      URL.revokeObjectURL(svgUrl);
      
      setSuccess('QR code downloaded successfully');
    } else {
      setError('Failed to download QR code');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">Generate Point Codes</h2>
      
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
      
      {/* Code Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Code Type</label>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              codeType === 'earn'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
            onClick={() => setCodeType('earn')}
          >
            Earn Points
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              codeType === 'redeem'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
            onClick={() => setCodeType('redeem')}
          >
            Redeem Points
          </button>
        </div>
      </div>
      
      {/* Points Amount Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Point Amount</label>
        <div className="flex flex-wrap gap-2">
          {[10, 25, 50, 100, 200, 500].map(amount => (
            <button
              key={amount}
              className={`px-3 py-1.5 rounded-md text-sm ${
                pointAmount === amount
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setPointAmount(amount)}
            >
              {amount} points
            </button>
          ))}
          
          <div className="w-24">
            <input
              type="number"
              value={pointAmount}
              onChange={(e) => setPointAmount(Number(e.target.value))}
              className="w-full px-3 py-1.5 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max="10000"
            />
          </div>
        </div>
      </div>
      
      {/* Expiry Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Time</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '1 hour', value: 60 },
            { label: '1 day', value: 1440 },
            { label: '1 week', value: 10080 },
            { label: '1 month', value: 43200 }
          ].map(option => (
            <button
              key={option.value}
              className={`px-3 py-1.5 rounded-md text-sm ${
                expiryMinutes === option.value
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
              }`}
              onClick={() => setExpiryMinutes(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Generate Button */}
      <Button
        variant="primary"
        onClick={handleGenerateCode}
        disabled={loading || !business?.id}
        className="w-full sm:w-auto"
      >
        {loading ? 'Generating...' : `Generate ${codeType === 'earn' ? 'Earn' : 'Redeem'} Code`}
      </Button>
      
      {/* Active Codes List */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">Active Codes ({activeCodes.length})</h3>
        
        {activeCodes.length === 0 ? (
          <p className="text-gray-500 text-sm">No active codes found for this program.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeCodes.map((code) => (
                  <React.Fragment key={code.id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{code.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          code.type === 'earn' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {code.type === 'earn' ? 'Earn' : 'Redeem'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{code.pointAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(code.expiresAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                        <button
                          onClick={() => toggleQrCode(code.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Show QR code"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(code.code)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Copy code"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleInvalidateCode(code.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete code"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {visibleQrCode === code.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex flex-col items-center mb-4 md:mb-0">
                              <div id={`qr-code-${code.id}`} className="bg-white p-4 rounded-lg shadow-md mb-2">
                                <QRCodeSVG
                                  value={generateQrCodeData(code)}
                                  size={150}
                                  level="H"
                                  includeMargin={true}
                                  bgColor="#ffffff"
                                  fgColor="#000000"
                                />
                              </div>
                              <div className="text-sm text-gray-500">
                                Scan to {code.type === 'earn' ? 'award' : 'redeem'} {code.pointAmount} points
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadQrCode(code.id, code.code)}
                                className="text-sm"
                              >
                                Download QR Code
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleQrCode(code.id)}
                                className="text-sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Hide QR Code
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointCodeGenerator; 