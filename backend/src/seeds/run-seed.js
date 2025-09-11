#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { seedGONXTDemo } = require('./gonxt-demo-seed');

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27018/tradeai_production';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`   - Cleared ${collection.name}`);
    }
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Main seeding function
const runSeed = async () => {
  try {
    console.log('🌱 Starting Trade AI Platform seeding process...\n');
    
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }
    
    // Check if we should clear existing data
    const shouldClear = process.argv.includes('--clear') || process.argv.includes('-c');
    
    if (shouldClear) {
      await clearDatabase();
      console.log('');
    }
    
    // Run GONXT demo seeding
    console.log('🏢 Seeding GONXT demo company and data...');
    const gonxtData = await seedGONXTDemo();
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('='.repeat(50));
    console.log(`Company: ${gonxtData.company.name}`);
    console.log(`Domain: ${gonxtData.company.domain}`);
    console.log(`Users: ${gonxtData.users.length + 1} (including super admin)`);
    console.log(`Customers: ${gonxtData.customers.length}`);
    console.log(`Products: ${gonxtData.products.length}`);
    console.log(`Budgets: ${gonxtData.budgets.length}`);
    console.log(`Promotions: ${gonxtData.promotions.length}`);
    console.log(`Trade Spends: ${gonxtData.tradeSpends.length}`);
    
    console.log('\n🔐 Login Information:');
    console.log('='.repeat(50));
    console.log('Super Admin Portal:');
    console.log('  Email: superadmin@tradeai.com');
    console.log('  Password: SuperAdmin123!');
    console.log('  Role: Super Admin (can manage all companies)');
    
    console.log('\nGONXT Company Portal:');
    console.log('  Admin: admin@gonxt.co.za / GonxtAdmin123!');
    console.log('  Manager: manager@gonxt.co.za / GonxtManager123!');
    console.log('  KAM 1: kam1@gonxt.co.za / GonxtKam123!');
    console.log('  KAM 2: kam2@gonxt.co.za / GonxtKam123!');
    console.log('  Analyst: analyst@gonxt.co.za / GonxtAnalyst123!');
    
    console.log('\n🌐 Application URLs:');
    console.log('='.repeat(50));
    console.log('Frontend: http://localhost:3000');
    console.log('Backend API: http://localhost:5001/api');
    console.log('MongoDB: mongodb://localhost:27018/tradeai_production');
    
    console.log('\n📊 Data Overview:');
    console.log('='.repeat(50));
    console.log('• 2 years of historical data (2023-2024)');
    console.log('• 10 major South African retailers');
    console.log('• 20 FMCG products across 4 categories');
    console.log('• 50+ promotions with realistic performance data');
    console.log('• 200+ trade spend records');
    console.log('• Complete budget planning and tracking');
    console.log('• Multi-tenant architecture ready');
    
    console.log('\n✨ Ready for demo and testing!');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Handle command line arguments
const showHelp = () => {
  console.log('Trade AI Platform Database Seeding Tool');
  console.log('');
  console.log('Usage: npm run seed [options]');
  console.log('');
  console.log('Options:');
  console.log('  --clear, -c    Clear existing data before seeding');
  console.log('  --help, -h     Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  npm run seed              # Seed data (keep existing)');
  console.log('  npm run seed --clear      # Clear and seed fresh data');
  console.log('');
};

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the seeding process
runSeed();