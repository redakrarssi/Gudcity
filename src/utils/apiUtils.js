import { useState } from 'react';

/**
 * API utilities for consistent error handling, database operations feedback,
 * and implementing loading states.
 */

// Base URL for API
const API_BASE_URL = '/api';

/**
 * Make an API request with standard error handling
 * @param {string} endpoint - API endpoint (without /api prefix)
 * @param {Object} options - Fetch options
 * @param {Function} showSuccess - Function to show success notification
 * @param {Function} showError - Function to show error notification
 * @returns {Promise<Object>} Response data or null on error
 */
export const apiRequest = async (endpoint, options = {}, showSuccess, showError) => {
  try {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Set default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Merge options
    const mergedOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    // Handle API response with standard success/error pattern
    if (data.success) {
      if (showSuccess && data.message) {
        showSuccess(data.message);
      }
      return data;
    } else {
      if (showError) {
        showError(data.message || 'Operation failed');
      }
      return null;
    }
  } catch (error) {
    console.error('API request error:', error);
    if (showError) {
      showError('Network or server error');
    }
    return null;
  }
};

/**
 * Makes a GET request to the API
 */
export const apiGet = (endpoint, showSuccess, showError) => {
  return apiRequest(endpoint, { method: 'GET' }, showSuccess, showError);
};

/**
 * Makes a POST request to the API
 */
export const apiPost = (endpoint, data, showSuccess, showError) => {
  return apiRequest(
    endpoint, 
    { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }, 
    showSuccess, 
    showError
  );
};

/**
 * Makes a PUT request to the API
 */
export const apiPut = (endpoint, data, showSuccess, showError) => {
  return apiRequest(
    endpoint, 
    { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }, 
    showSuccess, 
    showError
  );
};

/**
 * Makes a DELETE request to the API
 */
export const apiDelete = (endpoint, showSuccess, showError) => {
  return apiRequest(endpoint, { method: 'DELETE' }, showSuccess, showError);
};

/**
 * Custom hook for handling db operation loading state
 * @returns {Array} [isLoading, setIsLoading]
 */
export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false);
  return [isLoading, setIsLoading];
};

/**
 * Validate QR code existence
 * @param {string} content - QR code content
 * @param {string} businessId - Business ID to check against
 * @returns {Promise<Object>} Result with success/error state and data
 */
export const validateQRCode = async (content, businessId, showSuccess, showError) => {
  try {
    const response = await apiGet(
      `qr_codes?business_id=${businessId}&content=${encodeURIComponent(content)}`,
      null, // Don't show success notification on validation
      showError
    );
    
    if (response && response.qr_codes && response.qr_codes.length > 0) {
      if (showSuccess) {
        showSuccess('QR code is valid');
      }
      return {
        isValid: true,
        qrCode: response.qr_codes[0]
      };
    } else {
      if (showError) {
        showError('Invalid QR code');
      }
      return {
        isValid: false,
        qrCode: null
      };
    }
  } catch (error) {
    console.error('QR validation error:', error);
    if (showError) {
      showError('Error validating QR code');
    }
    return {
      isValid: false,
      qrCode: null,
      error
    };
  }
};

/**
 * Apply points to a loyalty card
 */
export const applyPointsToCard = async (cardId, points, showSuccess, showError) => {
  try {
    const response = await apiPut(
      `loyalty_cards/${cardId}`,
      { points_to_add: points },
      showSuccess,
      showError
    );
    
    return response;
  } catch (error) {
    console.error('Error applying points:', error);
    if (showError) {
      showError('Error applying points to card');
    }
    return null;
  }
};

/**
 * Redeem a reward
 */
export const redeemReward = async (customerId, rewardId, showSuccess, showError) => {
  try {
    const response = await apiPost(
      'redemption_codes',
      {
        customer_id: customerId,
        reward_id: rewardId,
        status: 'active'
      },
      showSuccess,
      showError
    );
    
    return response;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    if (showError) {
      showError('Error creating redemption code');
    }
    return null;
  }
}; 