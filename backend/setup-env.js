const fs = require('fs');
const path = require('path');

// Create .env file with default database configuration
const envContent = `# Database Configuration
DB_NAME=spicevault
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_DIALECT=mysql

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
  console.log('  Database: spicevault');
  console.log('  User: root');
  console.log('  Password: (empty)');
  console.log('  Host: localhost');
  
  console.log('\n💡 If your MySQL setup is different, please edit the .env file');
  console.log('   For example, if you have a password, change DB_PASSWORD=your_password');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
