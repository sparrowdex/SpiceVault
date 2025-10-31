const jwt = require('jsonwebtoken');

const payload = {
  user_id: 26,
  email: 'lisa.patel@example.com'
};

const secret = 'your-secret-key'; // This should match your JWT secret in the backend

const token = jwt.sign(payload, secret, { expiresIn: '1h' });

console.log('Generated JWT Token:', token);
