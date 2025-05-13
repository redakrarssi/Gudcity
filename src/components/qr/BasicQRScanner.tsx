import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Button from '../ui/Button';

type ScannerProps = {
  onScan: (data: string) => void;
  onClose?: () => void;
};

const BasicQRScanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-scanner-element';
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);
  
  const startScanner = async () => {
    if (!containerRef.current) return;
    
    try {
      // Create scanner element if it doesn't exist
      if (!document.getElementById(scannerDivId)) {
        const element = document.createElement('div');
        element.id = scannerDivId;
        element.style.width = '100%';
        element.style.height = '100%';
        
        // Clear container and append the scanner element
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(element);
      }
      
      // Initialize scanner
      scannerRef.current = new Html5Qrcode(scannerDivId);
      setScanning(true);
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (data) => {
          // QR code detected
          onScan(data);
          stopScanner();
        },
        (errorMsg) => {
          // Only handle critical errors
          if (errorMsg.includes('permission')) {
            setError('Camera permission denied');
            stopScanner();
          }
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Failed to start scanner');
      stopScanner();
    }
  };
  
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
    setScanning(false);
  };
  
  return (
    <div className="p-4 bg-white rounded-lg">
      <h3 className="text-lg font-bold mb-4">Scan QR Code</h3>
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-64 border rounded mb-4 flex items-center justify-center"
      >
        {!scanning && (
          <div className="text-center text-gray-500">
            <p>Click Start to activate camera</p>
          </div>
        )}
      </div>
      
      <div className="flex space-x-3 justify-center">
        {!scanning ? (
          <Button onClick={startScanner} variant="primary">
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="secondary">
            Stop
          </Button>
        )}
        
        {onClose && (
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        )}
      </div>
    </div>
  );
};

export default BasicQRScanner; 