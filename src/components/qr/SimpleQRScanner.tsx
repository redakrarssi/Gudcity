import React, { useEffect, useRef, useState } from 'react';
import { processQRCode, claimPoints } from '../../services/qrService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { Camera, X, AlertCircle, CheckCircle, ShieldAlert, Loader } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onSuccess?: (result: { success: boolean; message: string; transaction?: any }) => void;
  onClose?: () => void;
  isModal?: boolean;
}

const SimpleQRScanner: React.FC<QRScannerProps> = ({ onSuccess, onClose, isModal = false }) => {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; transaction?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().catch(err => {
        console.error("Error stopping scanner:", err);
      }).finally(() => {
        html5QrCodeRef.current = null;
        if (isMounted.current) {
          setScanning(false);
        }
      });
    } else {
      if (isMounted.current) {
        setScanning(false);
      }
    }
  };

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

  const startScanner = async () => {
    if (!user) {
      setError('You must be logged in to scan QR codes');
      return;
    }
    
    if (!qrContainerRef.current) {
      setError('Scanner initialization failed');
      return;
    }
    
    setError(null);
    setResult(null);
    setScanning(true);
    setLoading(true);
    
    try {
      const scannerId = `qr-reader-${Date.now()}`;
      
      if (!document.getElementById(scannerId)) {
        const scannerElement = document.createElement('div');
        scannerElement.id = scannerId;
        scannerElement.style.width = '100%';
        scannerElement.style.height = '100%';
        
        if (qrContainerRef.current) {
          qrContainerRef.current.innerHTML = '';
          qrContainerRef.current.appendChild(scannerElement);
        }
      }
      
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().then(() => {
              if (isMounted.current) {
                processQrContent(decodedText);
              }
            }).catch(err => {
              console.error("Error stopping scanner after successful scan:", err);
            });
          }
        },
        (errorMessage) => {
          if (errorMessage.includes("permission")) {
            if (isMounted.current) {
              setCameraPermission(false);
              setLoading(false);
              setError('Camera permission denied. Please allow camera access to scan QR codes.');
              stopScanner();
            }
          }
        }
      );
      
      if (isMounted.current) {
        setCameraPermission(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      if (isMounted.current) {
        setError(err?.message || 'Failed to start scanner');
        setScanning(false);
        setLoading(false);
      }
    }
  };

  const reset = () => {
    if (!isMounted.current) return;
    
    stopScanner();
    setResult(null);
    setError(null);
    setScanning(false);
    setCameraPermission(null);
    
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

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
          ref={qrContainerRef}
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

export default SimpleQRScanner; 