import { v4 as uuidv4 } from 'uuid';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../contexts/AuthContext';

// Types for loyalty programs
export interface LoyaltyProgram {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  description: string;
  pointsPerPurchase: number;
  rewardThreshold: number;
  rewardDescription: string;
  createdAt: Date;
  active: boolean;
}

// Types for QR codes
export interface QRData {
  type: 'earn' | 'redeem';
  businessId: string;
  programId: string;
  customerId?: string;
  code: string;
  timestamp: Date;
  pointsToEarn?: number;
  pointsToRedeem?: number;
  expiresAt: Date;
}

// Types for transactions
export interface Transaction {
  id: string;
  businessId: string;
  programId: string;
  customerId: string;
  type: 'earn' | 'redeem';
  points: number;
  timestamp: Date;
  status: 'completed' | 'cancelled' | 'pending';
}

// Generate QR code data for earning points
export const generateEarnQRCode = async (
  businessId: string,
  programId: string,
  pointsToEarn: number
): Promise<QRData> => {
  const code = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60000); // 5 minutes expiration
  
  const qrData: QRData = {
    type: 'earn',
    businessId,
    programId,
    code,
    timestamp: now,
    pointsToEarn,
    expiresAt
  };
  
  // Store QR code in Firestore
  await setDoc(doc(db, 'qrCodes', code), {
    ...qrData,
    timestamp: serverTimestamp(),
    expiresAt: expiresAt
  });
  
  return qrData;
};

// Generate QR code data for redeeming points
export const generateRedeemQRCode = async (
  businessId: string,
  programId: string,
  customerId: string,
  pointsToRedeem: number
): Promise<QRData> => {
  const code = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60000); // 5 minutes expiration
  
  const qrData: QRData = {
    type: 'redeem',
    businessId,
    programId,
    customerId,
    code,
    timestamp: now,
    pointsToRedeem,
    expiresAt
  };
  
  // Store QR code in Firestore
  await setDoc(doc(db, 'qrCodes', code), {
    ...qrData,
    timestamp: serverTimestamp(),
    expiresAt: expiresAt
  });
  
  return qrData;
};

// Process a scanned QR code
export const processQRCode = async (
  code: string,
  currentUser: User
): Promise<{ success: boolean; message: string; transaction?: Transaction }> => {
  try {
    // Get QR code data from Firestore
    const qrDoc = await getDoc(doc(db, 'qrCodes', code));
    
    if (!qrDoc.exists()) {
      return { success: false, message: 'Invalid QR code.' };
    }
    
    const qrData = qrDoc.data() as QRData;
    
    // Check if QR code has expired
    if (new Date() > new Date(qrData.expiresAt)) {
      return { success: false, message: 'QR code has expired.' };
    }
    
    // Handle based on QR code type and user role
    if (qrData.type === 'earn') {
      // Business scanning customer's earn QR code
      if (currentUser.role !== 'business') {
        return { success: false, message: 'Only businesses can award points.' };
      }
      
      if (qrData.businessId !== currentUser.businessId) {
        return { success: false, message: 'This QR code is for a different business.' };
      }
      
      // Create a transaction with pending status since we don't have the customer yet
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        businessId: qrData.businessId,
        programId: qrData.programId,
        customerId: '',  // Will be filled when customer scans
        type: 'earn',
        points: qrData.pointsToEarn,
        timestamp: serverTimestamp(),
        status: 'pending',
        qrCode: code
      });
      
      // Update QR code with transaction ID
      await updateDoc(doc(db, 'qrCodes', code), {
        transactionId: transactionRef.id
      });
      
      return { 
        success: true, 
        message: `Ready to award ${qrData.pointsToEarn} points. Let the customer scan to complete.`,
        transaction: {
          id: transactionRef.id,
          businessId: qrData.businessId,
          programId: qrData.programId,
          customerId: '',
          type: 'earn',
          points: qrData.pointsToEarn || 0,
          timestamp: new Date(),
          status: 'pending'
        }
      };
      
    } else if (qrData.type === 'redeem') {
      // Business confirming a redemption
      if (currentUser.role !== 'business') {
        return { success: false, message: 'Only businesses can confirm redemptions.' };
      }
      
      if (qrData.businessId !== currentUser.businessId) {
        return { success: false, message: 'This redemption is for a different business.' };
      }
      
      // Check if customer has enough points
      const customerDoc = await getDoc(doc(db, 'users', qrData.customerId!));
      if (!customerDoc.exists()) {
        return { success: false, message: 'Customer account not found.' };
      }
      
      const customerData = customerDoc.data();
      const customerPoints = customerData.points?.[qrData.businessId] || 0;
      
      if (customerPoints < (qrData.pointsToRedeem || 0)) {
        return { success: false, message: 'Customer does not have enough points.' };
      }
      
      // Create transaction
      const transactionRef = await addDoc(collection(db, 'transactions'), {
        businessId: qrData.businessId,
        programId: qrData.programId,
        customerId: qrData.customerId,
        type: 'redeem',
        points: qrData.pointsToRedeem,
        timestamp: serverTimestamp(),
        status: 'completed'
      });
      
      // Update customer points
      const newPoints = customerPoints - (qrData.pointsToRedeem || 0);
      await updateDoc(doc(db, 'users', qrData.customerId!), {
        [`points.${qrData.businessId}`]: newPoints
      });
      
      return { 
        success: true, 
        message: `Successfully redeemed ${qrData.pointsToRedeem} points.`,
        transaction: {
          id: transactionRef.id,
          businessId: qrData.businessId,
          programId: qrData.programId,
          customerId: qrData.customerId!,
          type: 'redeem',
          points: qrData.pointsToRedeem || 0,
          timestamp: new Date(),
          status: 'completed'
        }
      };
    }
    
    return { success: false, message: 'Invalid QR code type.' };
  } catch (error) {
    console.error('Error processing QR code:', error);
    return { success: false, message: 'An error occurred while processing the QR code.' };
  }
};

// Customer claiming points from a pending transaction
export const claimPoints = async (
  code: string,
  currentUser: User
): Promise<{ success: boolean; message: string }> => {
  try {
    if (currentUser.role !== 'customer') {
      return { success: false, message: 'Only customers can claim points.' };
    }
    
    // Get QR code data
    const qrDoc = await getDoc(doc(db, 'qrCodes', code));
    if (!qrDoc.exists()) {
      return { success: false, message: 'Invalid QR code.' };
    }
    
    const qrData = qrDoc.data() as QRData & { transactionId?: string };
    
    // Check if QR has a transaction
    if (!qrData.transactionId) {
      return { success: false, message: 'This QR code has not been scanned by a business yet.' };
    }
    
    // Get transaction
    const transactionDoc = await getDoc(doc(db, 'transactions', qrData.transactionId));
    if (!transactionDoc.exists()) {
      return { success: false, message: 'Transaction not found.' };
    }
    
    const transaction = transactionDoc.data();
    
    // Check if transaction is still pending
    if (transaction.status !== 'pending') {
      return { success: false, message: 'This transaction has already been processed.' };
    }
    
    // Update transaction with customer ID and mark as completed
    await updateDoc(doc(db, 'transactions', qrData.transactionId), {
      customerId: currentUser.uid,
      status: 'completed'
    });
    
    // Update customer's points
    const currentPoints = currentUser.points?.[qrData.businessId] || 0;
    const newPoints = currentPoints + (qrData.pointsToEarn || 0);
    
    await updateDoc(doc(db, 'users', currentUser.uid), {
      [`points.${qrData.businessId}`]: newPoints
    });
    
    return { 
      success: true, 
      message: `Successfully claimed ${qrData.pointsToEarn} points!` 
    };
  } catch (error) {
    console.error('Error claiming points:', error);
    return { success: false, message: 'An error occurred while claiming points.' };
  }
}; 