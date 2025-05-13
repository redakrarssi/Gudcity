import React, { useEffect, useRef, useState } from 'react';
// Remove the require statement which is causing the error
// and replace with a safer approach to loading the library
import { processQRCode, claimPoints } from '../../services/qrService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { Camera, X, AlertCircle, CheckCircle, ShieldAlert, Loader } from 'lucide-react';

// Import HTML5QRCode as a dynamic import to avoid require issues
let Html5QrCode: any = null;

// Load HTML5QRCode library dynamically
const loadQrCodeLibrary = async () => {
  if (!Html5QrCode) {
    try {
      // Use dynamic import instead of require
      const module = await import('html5-qrcode');
      // Access the default export for Html5Qrcode
      Html5QrCode = module.default;
      return true;
    } catch (error) {
      console.error('Error loading QR code library:', error);
      return false;
    }
  }
  return true;
};

interface QRScannerProps {
  onSuccess?: (result: { success: boolean; message: string; transaction?: any }) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onSuccess, onClose, isModal = false }) => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; transaction?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  
  const scannerRef = useRef<any>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Load the library when component mounts
  useEffect(() => {
    const loadLibrary = async () => {
      const loaded = await loadQrCodeLibrary();
      setLibraryLoaded(loaded);
      if (!loaded) {
        setError('Failed to load QR scanner library.');
      }
    };
    
    loadLibrary();
    
    // Cleanup function
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err: any) => {
          console.error('Error stopping scanner:', err);
        });
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      if (!user) {
        setError('You must be logged in to scan QR codes');
        return;
      }

      if (!libraryLoaded) {
        setError('QR scanner library is not loaded. Please refresh the page and try again.');
        return;
      }

      setError(null);
      setResult(null);
      setScanning(true);
      setLoading(true);

      // Request camera permission
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
      } catch (err) {
        setCameraPermission(false);
        setLoading(false);
        setScanning(false);
        setError('Camera permission denied. Please allow camera access to scan QR codes.');
        return;
      }

      if (!scannerContainerRef.current) {
        setError('Scanner container not found.');
        setLoading(false);
        setScanning(false);
        return;
      }

      // Create container for the scanner
      const scannerContainerId = 'qr-reader';
      let scannerElement = document.getElementById(scannerContainerId);
      
      if (!scannerElement) {
        scannerElement = document.createElement('div');
        scannerElement.id = scannerContainerId;
        scannerContainerRef.current.innerHTML = '';
        scannerContainerRef.current.appendChild(scannerElement);
      }
      
      try {
        // Initialize the scanner
        scannerRef.current = new Html5QrCode(scannerContainerId);
        
        await scannerRef.current.start(
          { facingMode: 'environment' }, // Use back camera
          {
            fps: 10, // Frame per seconds
            qrbox: { width: 250, height: 250 }, // QR box size
            aspectRatio: 1,
            disableFlip: false,
          },
          onScanSuccess,
          onScanFailure
        );
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error starting QR scanner:', err);
        setError(err?.message || 'Failed to start scanner. Please try again.');
        setScanning(false);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error in startScanner:', err);
      setError(err?.message || 'An unexpected error occurred.');
      setScanning(false);
      setLoading(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setScanning(false);
        })
        .catch((err: any) => {
          console.error('Error stopping QR scanner:', err);
        });
    } else {
      setScanning(false);
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
    } catch (err: any) {
      console.error('Error processing QR code:', err);
      setError(err?.message || 'Failed to process QR code');
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = (error: any) => {
    // Don't show error for every frame that doesn't have a QR code
    console.debug('QR scan frame processed without QR code');
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setScanning(false);
    setCameraPermission(null);
    
    // Clear scanner container
    if (scannerContainerRef.current) {
      scannerContainerRef.current.innerHTML = '';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow ${isModal ? 'fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6' : ''}`}>
      {isModal && (
        <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      )}
      
      <div className={`relative ${isModal ? 'w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-6' : 'p-4'}`}>
        {isModal && (
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        )}
        
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-blue-600" />
          {user?.role === 'business' ? 'Scan Customer QR Code' : 'Scan Business QR Code'}
        </h3>
        
        {error && (
          <div className="w-full bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {cameraPermission === false && (
          <div className="w-full bg-amber-50 text-amber-700 p-4 rounded-md mb-4 flex items-start">
            <ShieldAlert className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Camera access is required</p>
              <p className="text-sm mt-1">Please enable camera access in your browser settings and try again.</p>
            </div>
          </div>
        )}
        
        {result && (
          <div 
            className={`w-full p-4 rounded-md mb-4 ${
              result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            } flex items-start`}
          >
            {result.success ? (
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{result.success ? 'Success!' : 'Error'}</p>
              <p className="text-sm mt-1">{result.message}</p>
            </div>
          </div>
        )}
        
        <div 
          ref={scannerContainerRef} 
          className={`w-full mx-auto h-64 mb-4 flex items-center justify-center border rounded-lg overflow-hidden ${
            scanning ? 'border-blue-300 bg-gray-900' : 'border-gray-300'
          }`}
        >
          {loading && (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Loader className="h-8 w-8 mb-2 animate-spin" />
              <p>Initializing camera...</p>
            </div>
          )}
          
          {scanning && !loading && !scannerRef.current && (
            <div className="flex flex-col items-center justify-center text-white">
              <Camera className="h-12 w-12 mb-2 animate-pulse" />
              <p className="text-lg font-medium">Accessing camera...</p>
              <p className="text-sm mt-1">Please allow camera access when prompted</p>
            </div>
          )}
          
          {!scanning && !loading && !result && (
            <div className="text-center text-gray-500 flex flex-col items-center p-4">
              <Camera className="h-12 w-12 mb-2 text-gray-400" />
              <p className="text-lg font-medium">Camera preview will appear here</p>
              <p className="text-sm text-gray-400 mt-1">Click "Start Scanning" to activate your camera</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-center">
          {!scanning ? (
            <>
              <Button 
                onClick={startScanner} 
                variant="primary"
                disabled={loading}
                className="flex items-center"
              >
                {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Start Scanning
              </Button>
              
              {onClose && (
                <Button 
                  onClick={onClose} 
                  variant="secondary"
                  disabled={loading}
                >
                  Cancel
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
              onClick={reset} 
              variant="primary"
            >
              Scan Another
            </Button>
          )}
        </div>
        
        {!scanning && !loading && !result && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Scan a QR code from {user?.role === 'business' ? 'your customer' : 'a business'} to {user?.role === 'business' ? 'process rewards' : 'join a program or claim rewards'}
          </p>
        )}
      </div>
    </div>
  );
};

export default QRScanner; 