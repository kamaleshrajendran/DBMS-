require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/indoor-nav',
  JWT_SECRET: process.env.JWT_SECRET || 'your_secret_key_here',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
};
