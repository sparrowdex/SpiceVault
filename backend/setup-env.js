const fs = require('fs');
const path = require('path');

// Create .env file with default database configuration
const envContent = `# Database Configuration
DATABASE_URL="mysql://root:your_mysql_password_here@localhost:3306/spicevault"

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file already exists');
  } else {
    // Create .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file with default configuration');
  }
  
  console.log('\n📝 Current database configuration:');
  console.log('  DATABASE_URL: "mysql://root:your_mysql_password_here@localhost:3306/spicevault"');
  
  console.log('\n💡 If your MySQL setup is different, please edit the .env file');
  console.log('   Make sure to update the password in DATABASE_URL if needed.');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
