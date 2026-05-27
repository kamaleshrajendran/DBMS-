const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/env');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const visitorRoutes = require('./routes/visitor');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/visitor', visitorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Node environment: ${config.NODE_ENV}`);
});

module.exports = app;
