const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const chatRoutes = require('./api/chat');
const authRoutes = require('./api/auth');
const moodRoutes = require('./api/mood');
const assessmentRoutes = require('./api/assessment');
const postRoutes = require('./api/posts');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/posts', postRoutes);

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Connect to MongoDB and Start Server
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    let isFallback = false;

    if (!mongoUri) {
      console.warn('MONGODB_URI not found in .env. Falling back to temporary database.');
      isFallback = true;
    }

    try {
      if (!isFallback) {
        console.log('Connecting to MongoDB Atlas...');
        // Set a 5-second timeout so we don't hang if the IP is blocked
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to MongoDB Atlas successfully!');
      }
    } catch (connErr) {
      console.error('❌ MongoDB Atlas connection failed (Likely an IP Whitelist issue).');
      console.log('💡 Fix: Go to MongoDB Atlas -> Network Access -> Add Current IP Address.');
      isFallback = true;
    }

    if (isFallback) {
      console.log('🚀 Starting temporary in-memory database so the app stays functional...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const fallbackUri = mongoServer.getUri();
      await mongoose.connect(fallbackUri);
      console.log('⚠️  APP IS RUNNING using a temporary database. (Data will not be saved permanently)');
    }

    const server = app.listen(PORT, () => {
      console.log(`\n================================================`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`================================================\n`);
    });

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`❌ FATAL ERROR: Port ${PORT} is already in use!`);
        console.log(`💡 Fix: You probably have another version of this app running in another terminal. Close it and try again.`);
        process.exit(1);
      } else {
        console.error('Server error:', e);
      }
    });

    // Listen for errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('Mongoose runtime error:', err);
    });

  } catch (err) {
    console.error('Fatal error during startup:', err);
    process.exit(1);
  }
};

startServer();