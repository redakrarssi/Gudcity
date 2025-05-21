// Import node-fetch using CommonJS
const fetch = require('node-fetch');

// Test user data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer'
};

// Base URL for API
const baseUrl = 'http://localhost:3001';

// Function to test the registration endpoint
async function testRegistration() {
  try {
    console.log('Testing user registration...');
    const response = await fetch(`${baseUrl}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const status = response.status;
    const data = await response.json();
    
    console.log(`Registration response status: ${status}`);
    console.log('Registration response data:', data);
    
    if (status === 201 && data.success) {
      console.log('✅ Registration test passed!');
      return data.user;
    } else {
      console.log('❌ Registration test failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing registration:', error);
    return null;
  }
}

// Function to test the login endpoint
async function testLogin(email, password) {
  try {
    console.log(`Testing user login for ${email}...`);
    const response = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const status = response.status;
    const data = await response.json();
    
    console.log(`Login response status: ${status}`);
    console.log('Login response data:', data);
    
    if (status === 200 && data.success) {
      console.log('✅ Login test passed!');
      return data.user;
    } else {
      console.log('❌ Login test failed');
      return null;
    }
  } catch (error) {
    console.error('Error testing login:', error);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting API tests...');
  
  try {
    // Test registration
    const registeredUser = await testRegistration();
    
    if (registeredUser) {
      // Test login with the registered user
      await testLogin(testUser.email, testUser.password);
    }
    
    console.log('🏁 API tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests(); 