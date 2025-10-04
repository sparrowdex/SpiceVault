const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT token for a user ID
const generateToken = (userId, email) => {
  const token = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  return token;
};

// Example usage
const userId = 1; // Replace with actual user ID
const email = 'test@test.com'; // Replace with actual email

const token = generateToken(userId, email);
console.log('Generated JWT Token:', token);

module.exports = { generateToken };
