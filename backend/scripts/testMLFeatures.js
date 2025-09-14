// scripts/testMLFeatures.js - Test script for ML features

require('dotenv').config();

// Use built-in fetch (Node.js 18+) or fallback to node-fetch
let fetch;
try {
  // Try to use built-in fetch first (Node.js 18+)
  fetch = globalThis.fetch;
  if (!fetch) {
    throw new Error('Built-in fetch not available');
  }
} catch (error) {
  // Fallback to node-fetch if built-in fetch is not available
  try {
    fetch = require('node-fetch');
  } catch (nodeFetchError) {
    console.error('❌ Neither built-in fetch nor node-fetch is available.');
    console.log('💡 Solutions:');
    console.log('   1. Upgrade to Node.js 18+ (recommended)');
    console.log('   2. Install node-fetch: npm install node-fetch');
    process.exit(1);
  }
}

const BASE_URL = 'http://localhost:5000/api/ml';

async function testMLFeatures() {
  console.log('🧪 Testing ML Features...\n');

  try {
    // Test 1: Get recommendations
    console.log('1. Testing recommendations...');
    const recommendationsResponse = await fetch(`${BASE_URL}/recommendations/1?type=hybrid&limit=5`);
    const recommendationsData = await recommendationsResponse.json();
    
    if (recommendationsData.success) {
      console.log('✅ Recommendations working!');
      console.log(`   Found ${recommendationsData.recommendations.length} recommendations`);
    } else {
      console.log('❌ Recommendations failed:', recommendationsData.error);
    }

    // Test 2: Add a rating
    console.log('\n2. Testing rating system...');
    const ratingResponse = await fetch(`${BASE_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 1,
        recipe_id: 1,
        rating: 5,
        review_text: 'Test rating from script',
        datestamp: new Date().toISOString().split('T')[0]
      }),
    });
    
    const ratingData = await ratingResponse.json();
    
    if (ratingData.success) {
      console.log('✅ Rating system working!');
      console.log(`   ${ratingData.message}`);
    } else {
      console.log('❌ Rating system failed:', ratingData.error);
    }

    // Test 3: Record interaction
    console.log('\n3. Testing interaction tracking...');
    const interactionResponse = await fetch(`${BASE_URL}/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 1,
        recipe_id: 1,
        interaction_type: 'like',
        duration: null
      }),
    });
    
    const interactionData = await interactionResponse.json();
    
    if (interactionData.success) {
      console.log('✅ Interaction tracking working!');
      console.log(`   ${interactionData.message}`);
    } else {
      console.log('❌ Interaction tracking failed:', interactionData.error);
    }

    // Test 4: Get user ratings
    console.log('\n4. Testing user ratings retrieval...');
    const userRatingsResponse = await fetch(`${BASE_URL}/ratings/1`);
    const userRatingsData = await userRatingsResponse.json();
    
    if (userRatingsData.success) {
      console.log('✅ User ratings retrieval working!');
      console.log(`   Found ${userRatingsData.ratings.length} ratings for user 1`);
    } else {
      console.log('❌ User ratings retrieval failed:', userRatingsData.error);
    }

    console.log('\n🎉 ML Features test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.log('\nMake sure the backend server is running on port 5000');
  }
}

// Run the test
testMLFeatures();
