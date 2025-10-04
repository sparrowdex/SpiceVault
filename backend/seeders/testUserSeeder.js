const bcrypt = require('bcrypt');
const db = require('../models');
const User = db.User;

async function createTestUser() {
  try {
    const email = 'testuser@example.com';
    const password = 'TestPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('Test user already exists');
      return { email, password };
    }

    await User.create({
      email,
      password: hashedPassword,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User'
    });

    console.log('Test user created successfully');
    return { email, password };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}

module.exports = createTestUser;

// If run directly, create the user
if (require.main === module) {
  createTestUser().then(() => process.exit());
}
