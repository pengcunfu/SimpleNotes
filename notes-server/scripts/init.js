const mongoose = require('mongoose');
const { initializeBucket } = require('../utils/minio');
require('dotenv').config({ path: '../config.env' });

// Import models to ensure they are registered
require('../models/User');
require('../models/Document');

const initializeApp = async () => {
  try {
    console.log('🚀 Initializing SimpleNotes...');

    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Initialize Minio bucket
    console.log('🗄️  Initializing Minio bucket...');
    await initializeBucket();
    console.log('✅ Minio bucket initialized');

    // Check if we need to create indexes
    console.log('📊 Creating database indexes...');
    
    // Create indexes for User model
    const User = mongoose.model('User');
    await User.createIndexes();
    
    // Create indexes for Document model
    const Document = mongoose.model('Document');
    await Document.createIndexes();
    
    console.log('✅ Database indexes created');

    // Check for admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('⚠️  No admin user found. Please run: npm run create-admin');
    } else {
      console.log('✅ Admin user exists');
    }

    console.log('\n🎉 SimpleNotes initialization completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If no admin user exists, run: npm run create-admin');
    console.log('2. Start the server: npm run dev');
    console.log('3. Access the application at: http://localhost:8081');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run initialization
initializeApp();
