import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { Camera, AlertCircle, Loader } from 'lucide-react';

interface QRScannerProps {
  onSuccess?: (qrCodeData: string) => void;
  onClose?: () => void;
}

const MinimalQRScanner: React.FC<QRScannerProps> = ({ onSuccess, onClose }) => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);
  const scannerId = useRef(`qr-scanner-${Date.now()}`);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    scannerRef.current = null;
    if (isMounted.current) {
      setScanning(false);
    }
  };

  const startScanner = async () => {
    if (!containerRef.current) return;
    
    setError(null);
    setLoading(true);
    setScanning(true);
    
    try {
      // Create scanner container element if it doesn't exist
      let scannerElement = document.getElementById(scannerId.current);
      
      if (!scannerElement) {
        scannerElement = document.createElement('div');
        scannerElement.id = scannerId.current;
        scannerElement.style.width = '100%';
        scannerElement.style.height = '100%';
        
        // Clear the container and add the scanner element
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(scannerElement);
      }
      
      // Initialize scanner
      scannerRef.current = new Html5Qrcode(scannerId.current);
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // QR code detected
          if (scannerRef.current) {
            scannerRef.current.stop().then(() => {
              if (onSuccess && isMounted.current) {
                onSuccess(decodedText);
              }
            }).catch(console.error);
          }
        },
        (errorMessage) => {
          // Only handle permission errors
          if (errorMessage.includes("permission") && isMounted.current) {
            setError('Camera permission denied');
            stopScanner();
          }
        }
      );
      
      if (isMounted.current) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to start scanner:', err);
      if (isMounted.current) {
        setError('Failed to start scanner');
        setScanning(false);
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">QR Scanner</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-mb mb-4">
          <AlertCircle className="inline-block mr-2" size={16} />
          {error}
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="w-full h-64 border rounded-lg overflow-hidden mb-4 flex items-center justify-center"
      >
        {loading ? (
          <div className="text-center">
            <Loader className="h-8 w-8 mb-2 animate-spin mx-auto" />
            <p>Initializing camera...</p>
          </div>
        ) : !scanning ? (
          <div className="text-center text-gray-500">
            <Camera className="h-12 w-12 mb-2 mx-auto" />
            <p>Camera preview will appear here</p>
          </div>
        ) : null}
      </div>
      
      <div className="flex justify-center">
        {!scanning ? (
          <Button 
            onClick={startScanner} 
            variant="primary"
            disabled={loading}
          >
            Start Scanning
          </Button>
        ) : (
          <Button 
            onClick={stopScanner} 
            variant="secondary"
          >
            Stop Scanning
          </Button>
        )}
        
        {onClose && (
          <Button 
            onClick={onClose} 
            variant="secondary"
            className="ml-3"
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
};

export default MinimalQRScanner; 