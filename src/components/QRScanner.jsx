import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNotification } from '../contexts/NotificationContext';
import { validateQRCode } from '../utils/apiUtils';

const QRScanner = ({ businessId, onScanSuccess }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    // Initialize the QR code scanner
    const qrScanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false // verbose
    );

    setScanner(qrScanner);

    // Cleanup function
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  const startScanning = () => {
    if (!scanner) return;

    setIsScanning(true);
    setLastScanned(null);

    scanner.render(onScannerSuccess, onScannerError);
  };

  const stopScanning = () => {
    if (!scanner) return;

    scanner.clear();
    setIsScanning(false);
  };

  const onScannerSuccess = async (decodedText) => {
    // Stop scanner immediately to prevent multiple scans
    stopScanning();

    setLastScanned(decodedText);

    try {
      // Validate QR code against the database
      const result = await validateQRCode(
        decodedText, 
        businessId,
        (message) => {
          showSuccess(message || 'Valid QR code scanned');
          // Apply green UI feedback
          document.getElementById('scan-result').className = 'mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded';
        },
        (message) => {
          showError(message || 'Invalid QR code');
          // Apply red UI feedback
          document.getElementById('scan-result').className = 'mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded';
        }
      );

      // If valid and callback provided, execute it
      if (result.isValid && onScanSuccess) {
        onScanSuccess(decodedText, result.qrCode);
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      showError('Error processing QR code');
      // Apply red UI feedback
      document.getElementById('scan-result').className = 'mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded';
    }
  };

  const onScannerError = (error) => {
    console.warn(`QR Scanner error: ${error}`);
  };

  return (
    <div className="qr-scanner-container">
      <div className="controls mb-4">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Stop Scanning
          </button>
        )}
      </div>

      <div id="qr-reader" className="w-full max-w-sm mx-auto"></div>

      {lastScanned && (
        <div id="scan-result" className="mt-4 p-4 bg-gray-100 border border-gray-400 text-gray-700 rounded">
          <p>Scanned Code: {lastScanned}</p>
          <p className="text-sm">Validating...</p>
        </div>
      )}
    </div>
  );
};

export default QRScanner; 