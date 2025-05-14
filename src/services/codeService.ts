import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from 'nanoid';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, collection, getDocs, serverTimestamp, db } from './firebase';

// Create custom alphanumeric ID generator using nanoid
// Excluding similar looking characters: 0, O, 1, I, L
const generatePointCode = customAlphabet('23456789ABCDEFGHJKMNPQRSTUVWXYZ', 8);

// Types for point codes
export interface PointCode {
  id: string;            // The unique code identifier
  code: string;          // The user-facing code (e.g., XYZ12345)
  type: 'earn' | 'redeem'; // Type of code
  businessId: string;    // Business that generated this code
  programId: string;     // Loyalty program associated
  pointAmount: number;   // Amount of points to earn/redeem
  isUsed: boolean;       // Whether code has been used
  usedBy?: string;       // Customer ID who used the code
  usedAt?: Date;         // When the code was used
  createdAt: Date;       // When the code was created
  expiresAt: Date;       // When the code expires
  metadata?: Record<string, any>; // Additional data
}

/**
 * Generate a unique, secure code for earning points
 */
export const generateEarnCode = async (
  businessId: string,
  programId: string,
  pointAmount: number,
  expiryMinutes: number = 60, // Default expiry of 1 hour
  metadata: Record<string, any> = {}
): Promise<PointCode> => {
  console.log('Generating earn code with:', { businessId, programId, pointAmount, expiryMinutes, metadata });
  
  // Generate unique code
  const uniqueId = uuidv4();
  const userCode = generatePointCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);
  
  const pointCode: PointCode = {
    id: uniqueId,
    code: userCode,
    type: 'earn',
    businessId,
    programId,
    pointAmount,
    isUsed: false,
    createdAt: now,
    expiresAt,
    metadata
  };
  
  // Store code in Firestore
  try {
    console.log('Storing code in database', { code: userCode, id: uniqueId });
    
    await setDoc(doc(db, 'pointCodes', uniqueId), {
      ...pointCode,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt
    });
    
    // Also store by user-facing code for easy lookup
    await setDoc(doc(db, 'codeIndex', userCode), {
      pointCodeId: uniqueId
    });
    
    console.log('Code generated successfully', userCode);
    return pointCode;
  } catch (error) {
    console.error('Error generating earn code:', error);
    throw new Error('Failed to generate earn code');
  }
};

/**
 * Generate a unique, secure code for redeeming rewards
 */
export const generateRedeemCode = async (
  businessId: string,
  programId: string,
  pointAmount: number,
  expiryMinutes: number = 1440, // Default expiry of 24 hours
  metadata: Record<string, any> = {}
): Promise<PointCode> => {
  // Generate unique code
  const uniqueId = uuidv4();
  const userCode = generatePointCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);
  
  const pointCode: PointCode = {
    id: uniqueId,
    code: userCode,
    type: 'redeem',
    businessId,
    programId,
    pointAmount,
    isUsed: false,
    createdAt: now,
    expiresAt,
    metadata
  };
  
  // Store code in Firestore
  try {
    await setDoc(doc(db, 'pointCodes', uniqueId), {
      ...pointCode,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt
    });
    
    // Also store by user-facing code for easy lookup
    await setDoc(doc(db, 'codeIndex', userCode), {
      pointCodeId: uniqueId
    });
    
    return pointCode;
  } catch (error) {
    console.error('Error generating redeem code:', error);
    throw new Error('Failed to generate redemption code');
  }
};

/**
 * Validate and process a point code
 */
export const processPointCode = async (
  code: string,
  userId: string
): Promise<{
  success: boolean;
  message: string;
  pointCode?: PointCode;
}> => {
  try {
    // Lookup the code from the index
    const codeIndexRef = doc(db, 'codeIndex', code);
    const codeIndexDoc = await getDoc(codeIndexRef);
    
    if (!codeIndexDoc.exists()) {
      return { success: false, message: 'Invalid code.' };
    }
    
    const { pointCodeId } = codeIndexDoc.data();
    
    // Get the actual point code document
    const pointCodeRef = doc(db, 'pointCodes', pointCodeId);
    const pointCodeDoc = await getDoc(pointCodeRef);
    
    if (!pointCodeDoc.exists()) {
      return { success: false, message: 'Code details not found.' };
    }
    
    const pointCode = pointCodeDoc.data() as PointCode;
    
    // Check if the code is still valid
    if (pointCode.isUsed) {
      return { success: false, message: 'This code has already been used.' };
    }
    
    // Check if the code has expired
    const now = new Date();
    if (now > new Date(pointCode.expiresAt)) {
      return { success: false, message: 'This code has expired.' };
    }
    
    // Process the code based on type
    if (pointCode.type === 'earn') {
      // Get the user's current points
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { success: false, message: 'User not found.' };
      }
      
      const userData = userDoc.data();
      const currentPoints = userData.points?.[pointCode.businessId] || 0;
      
      // Update user's points
      await updateDoc(userRef, {
        [`points.${pointCode.businessId}`]: currentPoints + pointCode.pointAmount
      });
      
      // Mark code as used
      await updateDoc(pointCodeRef, {
        isUsed: true,
        usedBy: userId,
        usedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        message: `Congratulations! You've earned ${pointCode.pointAmount} points.`,
        pointCode
      };
      
    } else if (pointCode.type === 'redeem') {
      // Get the user's current points
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return { success: false, message: 'User not found.' };
      }
      
      const userData = userDoc.data();
      const currentPoints = userData.points?.[pointCode.businessId] || 0;
      
      // Check if user has enough points
      if (currentPoints < pointCode.pointAmount) {
        return { 
          success: false, 
          message: `You don't have enough points. You need ${pointCode.pointAmount} points, but you only have ${currentPoints}.` 
        };
      }
      
      // Update user's points
      await updateDoc(userRef, {
        [`points.${pointCode.businessId}`]: currentPoints - pointCode.pointAmount
      });
      
      // Mark code as used
      await updateDoc(pointCodeRef, {
        isUsed: true,
        usedBy: userId,
        usedAt: serverTimestamp()
      });
      
      // Add to redemption history
      await setDoc(doc(db, 'redemptions', uuidv4()), {
        userId,
        businessId: pointCode.businessId,
        programId: pointCode.programId,
        pointAmount: pointCode.pointAmount,
        codeId: pointCodeId,
        redeemedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        message: `Success! You've redeemed a reward for ${pointCode.pointAmount} points.`,
        pointCode
      };
    }
    
    return { success: false, message: 'Invalid code type.' };
    
  } catch (error) {
    console.error('Error processing point code:', error);
    return { success: false, message: 'An error occurred while processing the code.' };
  }
};

/**
 * Get active codes for a business
 */
export const getBusinessActiveCodes = async (
  businessId: string
): Promise<PointCode[]> => {
  try {
    console.log('Getting active codes for business:', businessId);
    const now = new Date();
    const codesQuery = query(
      collection(db, 'pointCodes'),
      where('businessId', '==', businessId),
      where('isUsed', '==', false),
      where('expiresAt', '>', now)
    );
    
    const querySnapshot = await getDocs(codesQuery);
    const codes = querySnapshot.docs.map(doc => ({ 
      ...doc.data(),
      id: doc.id 
    } as PointCode));
    
    console.log('Found active codes:', codes.length);
    
    // Only return mock data if no codes were found AND we're in development mode
    if (codes.length === 0 && window.BYPASS_AUTH) {
      console.log('No codes found, using mock code for development');
      return [{
        id: 'mock-code-1',
        code: 'TEST1234',
        type: 'earn',
        businessId,
        programId: 'program-1',
        pointAmount: 50,
        isUsed: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        metadata: { programName: 'GudPoints' }
      }];
    }
    
    return codes;
    
  } catch (error) {
    console.error('Error getting active codes:', error);
    // Return a mock code if we have none in development mode
    if (window.BYPASS_AUTH) {
      console.log('Using mock codes for development');
      return [{
        id: 'mock-code-1',
        code: 'TEST1234',
        type: 'earn',
        businessId,
        programId: 'program-1',
        pointAmount: 50,
        isUsed: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        metadata: { programName: 'GudPoints' }
      }];
    }
    return [];
  }
};

/**
 * Get a user's redemption history
 */
export const getUserRedemptionHistory = async (
  userId: string
): Promise<any[]> => {
  try {
    const redemptionsQuery = query(
      collection(db, 'redemptions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(redemptionsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
  } catch (error) {
    console.error('Error getting redemption history:', error);
    return [];
  }
};

/**
 * Invalidate a code (typically used by business owners)
 */
export const invalidateCode = async (
  codeId: string,
  businessId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the code
    const codeRef = doc(db, 'pointCodes', codeId);
    const codeDoc = await getDoc(codeRef);
    
    if (!codeDoc.exists()) {
      return { success: false, message: 'Code not found.' };
    }
    
    const pointCode = codeDoc.data() as PointCode;
    
    // Verify the business owns this code
    if (pointCode.businessId !== businessId) {
      return { success: false, message: 'You do not have permission to manage this code.' };
    }
    
    // Delete from codeIndex first
    await deleteDoc(doc(db, 'codeIndex', pointCode.code));
    
    // Then delete the actual code
    await deleteDoc(codeRef);
    
    return { success: true, message: 'Code successfully invalidated.' };
    
  } catch (error) {
    console.error('Error invalidating code:', error);
    return { success: false, message: 'An error occurred while invalidating the code.' };
  }
}; 