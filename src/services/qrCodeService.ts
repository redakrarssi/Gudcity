/**
 * QR Code Service
 * 
 * This service handles all QR code-related functionality including:
 * - Creating new QR codes
 * - Fetching QR codes for a business
 * - Updating QR code information
 * - Tracking QR code scans
 * - Deleting QR codes
 */

type QRCodeType = 'loyalty' | 'product' | 'promotion' | 'payment';

export interface QRCode {
  id: string;
  business_id: string;
  content: string;
  link_url?: string;
  code_type: QRCodeType;
  scans_count: number;
  unique_scans_count: number;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Get all QR codes for a business
 */
export const getBusinessQRCodes = async (businessId: string, type?: QRCodeType): Promise<QRCode[]> => {
  try {
    let url = `/api/qrcode?businessId=${businessId}`;
    if (type) url += `&codeType=${type}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching QR codes: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch QR codes:', error);
    throw error;
  }
};

/**
 * Create a new QR code
 */
export const createQRCode = async (data: {
  businessId: string;
  content: string;
  linkUrl?: string;
  codeType: QRCodeType;
  description?: string;
  metadata?: Record<string, any>;
}): Promise<QRCode> => {
  try {
    const response = await fetch('/api/qrcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create QR code');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create QR code:', error);
    throw error;
  }
};

/**
 * Update a QR code
 */
export const updateQRCode = async (
  id: string, 
  data: {
    content?: string;
    linkUrl?: string;
    description?: string;
    metadata?: Record<string, any>;
  }
): Promise<QRCode> => {
  try {
    const response = await fetch(`/api/qrcode?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update QR code');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update QR code:', error);
    throw error;
  }
};

/**
 * Track a QR code scan
 */
export const trackQRCodeScan = async (
  id: string, 
  uniqueScannerId?: string
): Promise<QRCode> => {
  try {
    const response = await fetch(`/api/qrcode?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scanned: true,
        uniqueScanner: uniqueScannerId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to track QR code scan');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to track QR code scan:', error);
    throw error;
  }
};

/**
 * Delete a QR code
 */
export const deleteQRCode = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/qrcode?id=${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete QR code');
    }
  } catch (error) {
    console.error('Failed to delete QR code:', error);
    throw error;
  }
}; 