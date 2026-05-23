const mongoose = require('mongoose');

let dbConnected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/indoor-nav';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });
    
    console.log('✓ MongoDB connected successfully');
    dbConnected = true;
    
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    console.log('\n⚠️  IMPORTANT: MongoDB is not running!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('To fix this:');
    console.log('1. Install MongoDB from: https://www.mongodb.com/try/download/community');
    console.log('2. Run mongod in another terminal');
    console.log('3. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Allow app to continue in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in DEVELOPMENT mode without database.');
      console.log('API calls will return mock data.\n');
      dbConnected = false;
    } else {
      console.error('✗ Production mode requires MongoDB connection!');
      process.exit(1);
    }
  }
};

const isDBConnected = () => dbConnected;

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;

