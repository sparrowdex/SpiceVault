const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Auth middleware - Authorization header:', authHeader ? 'present' : 'missing');
  if (!authHeader) {
    console.log('Auth middleware - No authorization header');
    return res.status(401).json({ success: false, error: 'No authorization header' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Auth middleware - Token extracted:', token ? 'present' : 'missing');
  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      console.log('Auth middleware - Token verification failed:', err.message);
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    console.log('Auth middleware - Token verified successfully for user:', decoded.user_id);
    req.user = decoded;
    next();
  });
};
