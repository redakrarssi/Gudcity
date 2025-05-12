import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { processQRCode, claimPoints } from '../../services/qrService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

interface QRScannerProps {
  onSuccess?: (result: { success: boolean; message: string }) => void;
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onSuccess, onClose }) => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!user) {
      setError('You must be logged in to scan QR codes');
      return;
    }

    setError(null);
    setResult(null);
    setScanning(true);

    try {
      if (!scannerContainerRef.current) return;

      const scannerContainerId = 'qr-reader';
      
      // Create the scanner HTML element
      if (!document.getElementById(scannerContainerId)) {
        const scannerElement = document.createElement('div');
        scannerElement.id = scannerContainerId;
        scannerContainerRef.current.appendChild(scannerElement);
      }
      
      // Initialize scanner
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanFailure
      );
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      setError('Failed to access camera. Please make sure you have granted camera permissions.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setScanning(false);
        })
        .catch((err) => {
          console.error('Error stopping QR scanner:', err);
        });
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (!user) return;
    
    // Stop scanner after successful scan
    stopScanner();
    setLoading(true);
    
    try {
      let processResult;
      
      if (user.role === 'business') {
        // Business scanning codes
        processResult = await processQRCode(decodedText, user);
      } else {
        // Customer claiming points
        processResult = await claimPoints(decodedText, user);
      }
      
      setResult(processResult);
      
      if (onSuccess) {
        onSuccess(processResult);
      }
    } catch (err) {
      console.error('Error processing QR code:', err);
      setError('Failed to process QR code');
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error: string) => {
    // Don't show error for every frame that doesn't have a QR code
    console.debug('QR scan failure:', error);
  };

  useEffect(() => {
    return () => {
      // Clean up scanner on component unmount
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        {user?.role === 'business' ? 'Scan Customer QR Code' : 'Scan Business QR Code'}
      </h3>
      
      {error && (
        <div className="w-full bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {result && (
        <div 
          className={`w-full p-3 rounded-md mb-4 ${
            result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {result.message}
        </div>
      )}
      
      <div 
        ref={scannerContainerRef} 
        className={`w-full max-w-sm h-64 mb-4 flex items-center justify-center border rounded-md ${
          scanning ? 'border-blue-300' : 'border-gray-300'
        }`}
      >
        {!scanning && !result && (
          <div className="text-center text-gray-500">
            Camera preview will appear here
          </div>
        )}
      </div>
      
      <div className="flex gap-3">
        {!scanning ? (
          <>
            <Button 
              onClick={startScanner} 
              variant="primary"
              disabled={loading}
            >
              Start Scanning
            </Button>
            
            {onClose && (
              <Button 
                onClick={onClose} 
                variant="secondary"
                disabled={loading}
              >
                Close
              </Button>
            )}
          </>
        ) : (
          <Button 
            onClick={stopScanner} 
            variant="secondary"
          >
            Stop Scanning
          </Button>
        )}
        
        {result && (
          <Button 
            onClick={() => {
              setResult(null);
              setError(null);
            }} 
            variant="primary"
          >
            Scan Another
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRScanner; 