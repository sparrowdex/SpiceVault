// scripts/simulateUserActivity.js - Simulate user ratings and interactions for ML data

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/ml';

// Sample test users (assumed to exist or created for testing)
const testUsers = [
  { user_id: 1, name: 'John Doe' },
  { user_id: 2, name: 'Emma Smith' },
  { user_id: 3, name: 'Liam Brown' },
  { user_id: 4, name: 'Olivia Davis' },
  { user_id: 5, name: 'Noah Wilson' },
  { user_id: 6, name: 'Ava Martinez' },
  { user_id: 7, name: 'James Taylor' },
  { user_id: 8, name: 'Sophia Lee' },
  { user_id: 9, name: 'William Harris' },
  { user_id: 10, name: 'Mia Clark' }
];

// Sample recipe IDs to interact with (should exist in DB)
const recipeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Random rating between 1 and 5
function getRandomRating() {
  return Math.floor(Math.random() * 5) + 1;
}

// Random interaction types
const interactionTypes = ['view', 'like', 'save', 'cook'];

function getRandomInteractionType() {
  return interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
}

// Simulate ratings for a user
async function simulateRatings(userId) {
  for (const recipeId of recipeIds) {
    const rating = getRandomRating();
    const reviewText = `Auto-generated rating ${rating} for recipe ${recipeId}`;
    try {
      const response = await fetch(`${BASE_URL}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          recipe_id: recipeId,
          rating,
          review_text: reviewText
        })
      });
      const data = await response.json();
      if (data.success) {
        console.log(`User ${userId} rated recipe ${recipeId} with ${rating} stars.`);
      } else {
        console.error(`Failed to rate recipe ${recipeId} for user ${userId}:`, data.error);
      }
    } catch (error) {
      console.error(`Error rating recipe ${recipeId} for user ${userId}:`, error.message);
    }
  }
}

// Simulate interactions for a user
async function simulateInteractions(userId) {
  for (const recipeId of recipeIds) {
    const interactionType = getRandomInteractionType();
    try {
      const response = await fetch(`${BASE_URL}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          recipe_id: recipeId,
          interaction_type: interactionType,
          duration: null
        })
      });
      const data = await response.json();
      if (data.success) {
        console.log(`User ${userId} recorded interaction '${interactionType}' on recipe ${recipeId}.`);
      } else {
        console.error(`Failed to record interaction on recipe ${recipeId} for user ${userId}:`, data.error);
      }
    } catch (error) {
      console.error(`Error recording interaction on recipe ${recipeId} for user ${userId}:`, error.message);
    }
  }
}

// Main simulation function
async function simulateUserActivity() {
  for (const user of testUsers) {
    console.log(`Simulating activity for user ${user.user_id} (${user.name})...`);
    await simulateRatings(user.user_id);
    await simulateInteractions(user.user_id);
  }
  console.log('User activity simulation completed.');
}

// Run simulation
simulateUserActivity();
