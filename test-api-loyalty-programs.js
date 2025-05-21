const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Test creating a loyalty program
async function testCreateLoyaltyProgram() {
  console.log('Testing loyalty program creation API...');
  
  const testData = {
    business_id: uuidv4(), // Generate a random business ID for testing
    name: 'Summer Deals',
    description: '10% off for loyal customers'
  };
  
  console.log('Sending test data:', testData);
  
  try {
    const response = await fetch('http://localhost:3001/api/loyalty-programs/create', {
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

// Run the test
testCreateLoyaltyProgram().then(() => {
  console.log('Test completed');
}); 