import fetch from 'node-fetch';

// Base URL for API
const baseUrl = 'http://localhost:3001';

// Test business data (you should replace this with a real UUID from your database)
const businessId = process.env.TEST_BUSINESS_ID || '66535dcd-fcb8-42a3-a245-248a9f86a8c6';

// Test functions
async function testRewardsEndpoint() {
  try {
    console.log('🧪 Testing rewards endpoint...');
    
    // Create a reward
    const reward = {
      name: 'Free Coffee',
      description: 'Get a free coffee after earning 10 points',
      points_required: 10,
      business_id: businessId,
      is_active: true
    };
    
    const response = await fetch(`${baseUrl}/api/rewards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reward)
    });
    
    const data = await response.json();
    console.log(`Response ${response.status}:`, data);
    
    // If successful, test GET endpoint
    if (response.status === 201 && data.success) {
      console.log('✅ Reward created successfully!');
      
      // Get the rewards for the business
      const getResponse = await fetch(`${baseUrl}/api/rewards?business_id=${businessId}`);
      const getResult = await getResponse.json();
      
      console.log(`GET Response ${getResponse.status}:`, getResult);
      console.log('✅ Rewards fetched successfully!');
      
      return data.reward.id;
    } else {
      console.log('❌ Failed to create reward');
      return null;
    }
  } catch (error) {
    console.error('Error testing rewards endpoint:', error);
    return null;
  }
}

async function testLoyaltyProgramEndpoint() {
  try {
    console.log('🧪 Testing loyalty program endpoint...');
    
    // Create a loyalty program
    const program = {
      name: 'Coffee Lovers',
      business_id: businessId,
      description: 'Earn points with every coffee purchase',
      points_per_purchase: 1,
      points_per_referral: 5,
      is_active: true
    };
    
    const response = await fetch(`${baseUrl}/api/loyalty_programs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program)
    });
    
    const data = await response.json();
    console.log(`Response ${response.status}:`, data);
    
    // If successful or already exists, test GET endpoint
    if ((response.status === 201 || response.status === 409) && (data.success || data.program)) {
      console.log('✅ Loyalty program created or already exists!');
      
      // Get the program for the business
      const getResponse = await fetch(`${baseUrl}/api/loyalty_programs?business_id=${businessId}`);
      const getResult = await getResponse.json();
      
      console.log(`GET Response ${getResponse.status}:`, getResult);
      console.log('✅ Loyalty program fetched successfully!');
      
      return data.program?.id || getResult.programs[0]?.id;
    } else {
      console.log('❌ Failed to create loyalty program');
      return null;
    }
  } catch (error) {
    console.error('Error testing loyalty program endpoint:', error);
    return null;
  }
}

async function testSettingsEndpoint() {
  try {
    console.log('🧪 Testing settings endpoint...');
    
    // Create a setting
    const setting = {
      business_id: businessId,
      settings_key: 'theme',
      settings_value: {
        primary_color: '#3498db',
        secondary_color: '#2ecc71',
        dark_mode: false
      }
    };
    
    const response = await fetch(`${baseUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(setting)
    });
    
    const data = await response.json();
    console.log(`Response ${response.status}:`, data);
    
    // If successful, test GET endpoint
    if ((response.status === 201 || response.status === 200) && data.success) {
      console.log('✅ Setting created or updated successfully!');
      
      // Get the setting for the business
      const getResponse = await fetch(`${baseUrl}/api/settings?business_id=${businessId}&settings_key=theme`);
      const getResult = await getResponse.json();
      
      console.log(`GET Response ${getResponse.status}:`, getResult);
      console.log('✅ Setting fetched successfully!');
      
      return true;
    } else {
      console.log('❌ Failed to create setting');
      return false;
    }
  } catch (error) {
    console.error('Error testing settings endpoint:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API dashboard tests...');
  
  try {
    // Test rewards endpoint
    const rewardId = await testRewardsEndpoint();
    console.log();
    
    // Test loyalty program endpoint
    const programId = await testLoyaltyProgramEndpoint();
    console.log();
    
    // Test settings endpoint
    const settingsResult = await testSettingsEndpoint();
    console.log();
    
    console.log('🏁 API dashboard tests completed!');
    console.log('Results:');
    console.log(`Rewards: ${rewardId ? '✅' : '❌'}`);
    console.log(`Loyalty Program: ${programId ? '✅' : '❌'}`);
    console.log(`Settings: ${settingsResult ? '✅' : '❌'}`);
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests(); 