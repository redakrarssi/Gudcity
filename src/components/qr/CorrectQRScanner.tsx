import React, { useEffect, useRef, useState } from 'react';
import { processQRCode, claimPoints } from '../../services/qrService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { Camera, X, AlertCircle, CheckCircle, ShieldAlert, Loader } from 'lucide-react';
// Remove the import that's causing issues
// import { Html5Qrcode } from 'html5-qrcode';

// This component uses the CDN version loaded in index.html

interface QRScannerProps {
  onSuccess?: (result: { success: boolean; message: string; transaction?: any }) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const CorrectQRScanner: React.FC<QRScannerProps> = ({ onSuccess, onClose, isModal = false }) => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; transaction?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const scannerElementRef = useRef<HTMLDivElement | null>(null);
  const scannerElementId = useRef(`qr-reader-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const isMounted = useRef(true);

  // Setup effect for mount/unmount
  useEffect(() => {
    isMounted.current = true;
    
    // Load the script immediately if it's not yet loaded
    if (typeof window !== 'undefined' && !(window as any).Html5Qrcode) {
      loadQrScript();
    }
    
    return () => {
      isMounted.current = false;
      stopScanner();
      
      // Clean up any remaining scanner elements
      try {
        if (scannerElementRef.current && containerRef.current && containerRef.current.contains(scannerElementRef.current)) {
          containerRef.current.removeChild(scannerElementRef.current);
        }
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    };
  }, []);
  
  // Function to load the QR code script dynamically if needed
  const loadQrScript = () => {
    if (typeof window !== 'undefined' && !(window as any).Html5Qrcode) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.async = true;
      script.onload = () => {
        console.log("Html5Qrcode script loaded successfully");
      };
      script.onerror = () => {
        console.error("Failed to load Html5Qrcode script");
        if (isMounted.current) {
          setError("Failed to load QR scanner. Please check your internet connection.");
        }
      };
      document.head.appendChild(script);
    }
  };

  // Stop scanner safely
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch((err: Error) => {
        console.error("Error stopping scanner:", err);
      });
    }
    
    scannerRef.current = null;
    
    if (isMounted.current) {
      setScanning(false);
    }
  };

  // Process QR code data
  const processQrContent = async (content: string) => {
    if (!user || !isMounted.current) return;
    
    try {
      let processResult;
      
      if (user.role === 'business') {
        processResult = await processQRCode(content, user);
      } else {
        processResult = await claimPoints(content, user);
      }
      
      if (isMounted.current) {
        setResult(processResult);
        
        if (onSuccess) {
          onSuccess(processResult);
        }
      }
    } catch (err: any) {
      console.error('Error processing QR code:', err);
      if (isMounted.current) {
        setError(err?.message || 'Failed to process QR code');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Start the scanner
  const startScanner = async () => {
    if (!user) {
      setError('You must be logged in to scan QR codes');
      return;
    }
    
    if (!containerRef.current) return;
    
    setError(null);
    setResult(null);
    setScanning(true);
    setLoading(true);
    
    // Make sure the script is loaded
    if (typeof window !== 'undefined' && !(window as any).Html5Qrcode) {
      loadQrScript();
      // Wait for script to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If still not loaded, show error
      if (!(window as any).Html5Qrcode) {
        setError('QR scanner failed to load. Please refresh the page and try again.');
        setScanning(false);
        setLoading(false);
        return;
      }
    }
    
    try {
      // Get the Html5Qrcode constructor from window
      const Html5Qrcode = (window as any).Html5Qrcode;
      
      if (!Html5Qrcode) {
        throw new Error(
          "QR code scanner library not available. Please check your internet connection or try refreshing the page."
        );
      }

      // First clean up any existing scanner elements
      if (containerRef.current) {
        // Safely clear container - only remove our scanner elements, not other children
        try {
          const existingElement = document.getElementById(scannerElementId.current);
          if (existingElement && containerRef.current.contains(existingElement)) {
            containerRef.current.removeChild(existingElement);
          }
          
          // Also check our ref
          if (scannerElementRef.current && containerRef.current.contains(scannerElementRef.current)) {
            containerRef.current.removeChild(scannerElementRef.current);
          }
        } catch (err) {
          console.error('Cleanup error:', err);
          // Continue anyway, as we'll create a new element
        }
      }
      
      // Create new scanner element with unique ID
      const scannerElement = document.createElement('div');
      scannerElement.id = scannerElementId.current;
      scannerElement.style.width = '100%';
      scannerElement.style.height = '100%';
      scannerElementRef.current = scannerElement;
      
      // Add scanner element to container
      if (containerRef.current) {
        containerRef.current.appendChild(scannerElement);
      } else {
        throw new Error('Container reference is not available');
      }
      
      // Initialize scanner
      try {
        scannerRef.current = new Html5Qrcode(scannerElementId.current);
        
        // Start scanning with more explicit configuration
        await scannerRef.current.start(
          { facingMode: "environment" },
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            formatsToSupport: (window as any).Html5QrcodeSupportedFormats ? 
              [(window as any).Html5QrcodeSupportedFormats.QR_CODE] : undefined
          },
          (decodedText: string) => {
            // QR code detected
            if (scannerRef.current) {
              scannerRef.current.stop().then(() => {
                if (isMounted.current) {
                  processQrContent(decodedText);
                }
              }).catch(console.error);
            }
          },
          (errorMessage: string) => {
            // Handle permission errors and other errors more gracefully
            console.log("Scanner feedback:", errorMessage);
            
            if (errorMessage.includes("permission") && isMounted.current) {
              setError('Camera permission denied. Please allow camera access in your browser settings.');
              stopScanner();
            } else if (errorMessage.includes("starting") && isMounted.current) {
              // Don't treat scanning errors as fatal, just log them
              console.warn("Scanning in progress...", errorMessage);
            }
          }
        );
      } catch (initError: any) {
        console.error("Scanner initialization error:", initError);
        const errorMessage = initError.message || "Unknown error";
        
        // Check for the specific error about QR_CODE being undefined
        if (errorMessage.includes("Cannot read properties of undefined") && 
            errorMessage.includes("QR_CODE")) {
          throw new Error(
            "QR scanner failed to initialize properly. Please refresh the page and try again."
          );
        } else {
          throw new Error(
            `Could not initialize camera: ${errorMessage}. Please ensure you've granted camera permissions.`
          );
        }
      }
      
      if (isMounted.current) {
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Scanner error:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to start scanner. Please try again or use a different device.');
        setScanning(false);
        setLoading(false);
      }
    }
  };

  // Reset the component
  const reset = () => {
    stopScanner();
    
    if (isMounted.current) {
      setResult(null);
      setError(null);
    }
    
    // Generate a new scanner ID for next use
    scannerElementId.current = `qr-reader-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  // Handle close action
  const handleClose = () => {
    stopScanner();
    if (onClose) onClose();
  };

  return (
    <div className={`bg-white rounded-lg shadow ${isModal ? 'fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6' : ''}`}>
      {isModal && (
        <div className="absolute inset-0 bg-black/70" onClick={handleClose}></div>
      )}
      
      <div className={`relative ${isModal ? 'w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden p-6' : 'p-4'}`}>
        {isModal && (
          <button 
            onClick={handleClose}
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
          ref={containerRef}
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
                  onClick={handleClose} 
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

export default CorrectQRScanner; 