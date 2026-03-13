// server.js (Hamara main backend server)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const announcementRoutes = require('./routes/announcementRoutes'); // <-- NAYA IMPORT

dotenv.config();

// --- REGISTER ALL MODELS FIRST (To avoid MissingSchemaError) ---
require('./models/userModel');
require('./models/contentModel');
require('./models/categoryModel');
require('./models/announcementModel');
require('./models/subscriptionModel');
require('./models/requestModel');
// -------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI; 
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined. Please add it to your environment variables (e.g., in Vercel Dashboard).');
  // In production, we don't want to crash immediately if possible to see other logs, 
  // but for DB connection, it's a hard requirement.
  if (process.env.NODE_ENV === 'production') {
    // Optional: Log more production-specific debug info here
  }
}

mongoose.connect(MONGO_URI, { 
  family: 4,
  serverSelectionTimeoutMS: 5000, // 5 seconds ke baad timeout ho jaye agar connection nahi bante
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
  .then(() => console.log('MongoDB connected!'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // In production (Vercel), we might want to log this specifically for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log('TIP: Check if your IP (or 0.0.0.0/0) is whitelisted in MongoDB Atlas.');
    }
  });

// Test Route
app.get('/', (req, res) => {
  res.send('Hello from GyanStack Backend!');
});

// --- API Routes ko Use Karein ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
// --- FIX YAHIN HAI (Typo tha) ---
app.use('/api/admin', require('./routes/adminRoutes')); 
app.use('/api/announcements', announcementRoutes); // <-- NAYA REGISTRATION
// ---------------------------------

// Server ko start karein (Sirf local development ke liye zaroori hai)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Vercel deployment ke liye app ko export karna zaroori hai
module.exports = app;