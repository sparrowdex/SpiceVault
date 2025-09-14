// scripts/seedMLData.js - Script to seed ML training data

require('dotenv').config();
const { seedMLData } = require('../seeders/mlDataSeeder');

async function main() {
  try {
    console.log('🚀 Starting ML data seeding process...');
    await seedMLData();
    console.log('🎉 ML data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 ML data seeding failed:', error);
    process.exit(1);
  }
}

main();
