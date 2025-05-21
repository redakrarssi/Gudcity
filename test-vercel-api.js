const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// URL configuration
const VERCEL_URL = process.env.VERCEL_URL || 'localhost:3000';
const API_BASE_URL = VERCEL_URL.startsWith('localhost') 
  ? `http://${VERCEL_URL}` 
  : `https://${VERCEL_URL}`;

// Test health check endpoint
async function testHealthCheck() {
  console.log('Testing API health...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Health check response:', data);
    
    if (data.success) {
      console.log('✅ API health check PASSED!');
    } else {
      console.log('❌ API health check FAILED!');
    }
  } catch (error) {
    console.error('Error checking API health:', error);
    console.log('❌ API health check FAILED due to error!');
  }
}

// Test creating a loyalty program
async function testCreateLoyaltyProgram() {
  console.log('\nTesting loyalty program creation API...');
  
  const testData = {
    business_id: uuidv4(), // Generate a random business ID for testing
    name: 'Summer Deals',
    description: '10% off for loyal customers'
  };
  
  console.log('Sending test data:', testData);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/loyalty-programs/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success) {
      console.log('✅ Loyalty program creation test PASSED!');
    } else {
      console.log('❌ Loyalty program creation test FAILED!');
    }
    
    return data;
  } catch (error) {
    console.error('Error during test:', error);
    console.log('❌ Loyalty program creation test FAILED due to error!');
  }
}

// Run all tests
async function runTests() {
  await testHealthCheck();
  await testCreateLoyaltyProgram();
  console.log('\nAll tests completed');
}

runTests(); 