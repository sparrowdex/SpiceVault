// scripts/createTestUsers.js - Create additional test users for ML

require('dotenv').config();
const { User } = require('../models');
const bcrypt = require('bcryptjs');

const testUsers = [
  {
    f_name: 'Alice',
    l_name: 'Johnson',
    email: 'alice.johnson@test.com',
    password: 'password123',
    user_type: 'Regular',
    date_joined: '2024-01-15'
  },
  {
    f_name: 'Bob',
    l_name: 'Smith',
    email: 'bob.smith@test.com',
    password: 'password123',
    user_type: 'Regular',
    date_joined: '2024-02-20'
  },
  {
    f_name: 'Carol',
    l_name: 'Davis',
    email: 'carol.davis@test.com',
    password: 'password123',
    user_type: 'Chef',
    date_joined: '2024-03-10'
  },
  {
    f_name: 'David',
    l_name: 'Wilson',
    email: 'david.wilson@test.com',
    password: 'password123',
    user_type: 'Regular',
    date_joined: '2024-03-25'
  },
  {
    f_name: 'Eva',
    l_name: 'Brown',
    email: 'eva.brown@test.com',
    password: 'password123',
    user_type: 'Regular',
    date_joined: '2024-04-05'
  }
];

async function createTestUsers() {
  try {
    console.log('👥 Creating test users for ML...');

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Create user
        await User.create({
          ...userData,
          password: hashedPassword
        });
        
        console.log(`✅ Created user: ${userData.f_name} ${userData.l_name}`);
      } else {
        console.log(`⏭️ User already exists: ${userData.f_name} ${userData.l_name}`);
      }
    }

    console.log('🎉 Test users creation completed!');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  }
}

createTestUsers();
