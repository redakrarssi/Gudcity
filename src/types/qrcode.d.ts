declare module 'qrcode.react' {
  import * as React from 'react';

  export interface QRCodeSVGProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      x?: number;
      y?: number;
      height?: number;
      width?: number;
      excavate?: boolean;
    };
  }

  export class QRCodeSVG extends React.Component<QRCodeSVGProps> {}
  export class QRCodeCanvas extends React.Component<QRCodeSVGProps> {}
}

declare module 'html5-qrcode' {
  export default class Html5Qrcode {
    constructor(elementId: string);
    
    isScanning: boolean;
    
    start(
      cameraIdOrConfig: string | { facingMode: string },
      config: {
        fps: number;
        qrbox?: number | { width: number; height: number };
        aspectRatio?: number;
        disableFlip?: boolean;
      },
      qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void,
      qrCodeErrorCallback?: (errorMessage: string, error: any) => void
    ): Promise<void>;
    
    stop(): Promise<void>;
    
    clear(): void;
  }

  export interface Html5QrcodeScannerConfig {
    fps?: number;
    qrbox?: number | { width: number; height: number };
    aspectRatio?: number;
    disableFlip?: boolean;
    formatsToSupport?: string[];
  }

  export class Html5QrcodeScanner {
    constructor(
      elementId: string,
      config: Html5QrcodeScannerConfig,
      verbose: boolean
    );
    
    render(
      qrCodeSuccessCallback: (decodedText: string, decodedResult: any) => void,
      qrCodeErrorCallback?: (errorMessage: string, error: any) => void
    ): void;
    
    clear(): void;
  }
} 