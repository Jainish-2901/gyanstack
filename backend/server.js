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
require('./models/contactModel');
// -------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://gyanstack.vercel.app',
  'https://gyanstack-admin.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})); 
app.use(express.json());

// Database Connection Utility for Serverless environments
let cachedConnection = null;
const connectDB = async () => {
    if (cachedConnection) return cachedConnection;
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing in environment variables');
    }
    
    // Create new connection if none cached
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4,
            serverSelectionTimeoutMS: 8000,
        });
        cachedConnection = conn;
        console.log('MongoDB connection established successfully');
        return conn;
    } catch (err) {
        console.error('MongoDB Initial Connection Error:', err.message);
        throw err;
    }
};

// Middleware to ensure DB connection is ready before handling requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: 'Database connection failure',
            error: process.env.NODE_ENV === 'production' ? 'Internal Connection Error' : err.message 
        });
    }
});

// Test Route
app.get('/', (req, res) => {
  res.send('GyanStack Backend API is running... Status: OK');
});

// --- API Routes ko Use Karein ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
// --- FIX YAHIN HAI (Typo tha) ---
app.use('/api/admin', require('./routes/adminRoutes')); 
app.use('/api/announcements', announcementRoutes); 
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
// ---------------------------------

// Server ko start karein (Sirf local development ke liye zaroori hai)
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  // High timeout for large file uploads (10 minutes)
  server.timeout = 600000; 
}

// Vercel deployment ke liye app ko export karna zaroori hai
module.exports = app;