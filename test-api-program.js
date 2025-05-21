const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

// Test creating a program
async function testCreateProgram() {
  console.log('Testing program creation API...');
  
  const testData = {
    businessId: uuidv4(), // Generate a random business ID for testing
    name: 'Test Program',
    type: 'points',
    description: 'Program created via test script',
    rules: {
      pointsPerDollar: 10
    },
    active: true
  };
  
  console.log('Sending test data:', testData);
  
  try {
    const response = await fetch('http://localhost:3000/api/programs', {
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
      console.log('✅ Program creation test PASSED!');
    } else {
      console.log('❌ Program creation test FAILED!');
    }
    
    return data;
  } catch (error) {
    console.error('Error during test:', error);
    console.log('❌ Program creation test FAILED due to error!');
  }
}

// Run the test
testCreateProgram().then(() => {
  console.log('Test completed');
}); 