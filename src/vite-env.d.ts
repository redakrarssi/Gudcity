/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string;
  readonly VITE_USE_MOCK_DATA: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global window extensions
interface Window {
  BYPASS_AUTH?: boolean;
  dataLayer?: any[];
  Html5Qrcode?: any;
  Html5QrcodeSupportedFormats?: any;
}

// HTML5 QR code library global declarations
declare namespace Html5QrCode {
  interface Html5QrcodeScannerConfig {
    fps: number;
    qrbox?: number | { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    formatsToSupport?: Array<number>;
  }
}
