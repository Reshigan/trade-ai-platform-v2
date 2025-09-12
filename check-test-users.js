const mongoose = require('mongoose');
const TestUser = require('./src/models/TestUser');

async function checkTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trade-ai-platform');
    console.log('Connected to MongoDB');

    const users = await TestUser.find({});
    console.log('TestUsers in database:', JSON.stringify(users, null, 2));

    // Also check if we can find the specific user
    const adminUser = await TestUser.findOne({ email: 'admin@tradeai.com' });
    console.log('Admin user found:', adminUser ? 'Yes' : 'No');
    if (adminUser) {
      console.log('Admin user details:', JSON.stringify(adminUser, null, 2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkTestUsers();