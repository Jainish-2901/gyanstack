// server.js (Hamara main backend server)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit'); // NAYA IMPORT
const announcementRoutes = require('./routes/announcementRoutes'); // <-- NAYA IMPORT

dotenv.config();

// --- RATE LIMITERS (Protective Shields) ---
// 1. General API Limiter (100 requests/15min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Increased for development
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Auth Limiter (Brute-force protection: 10 attempts/15min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 1000, // Increased for development
  message: { message: "Too many login/signup attempts. Please wait 15 minutes." },
});

// 3. AI Assistant Limiter (Cost & Abuse Control: 20 requests/15min)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "AI daily limit reached for this session. Please try again later." },
});
// ------------------------------------------

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

// --- THE CRITICAL FIX FOR VERCEL/PRODUCTION ---
app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'https://gyanstack.vercel.app',
  'https://gyanstack-admin.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// --- DIAGNOSTIC LOGGER (Proof of Life) ---
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}
// -----------------------------------------

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection Utility
let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  // If a connection attempt is already in progress, wait for it
  if (connectionPromise) return connectionPromise;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables');
  }

  connectionPromise = (async () => {
    try {
      console.log('Attempting to connect to MongoDB...');
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        family: 4,
        bufferCommands: true, // Re-enable buffering for startup stability
      });

      console.log('MongoDB connection established successfully');

      // Watchdog for connection health
      if (mongoose.connection.listenerCount('error') === 0) {
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB Runtime Error:', err);
          cachedConnection = null;
        });
      }

      if (mongoose.connection.listenerCount('disconnected') === 0) {
        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB Disconnected. Reconnect pending...');
          cachedConnection = null;
        });
      }

      return conn;
    } catch (err) {
      console.error('MongoDB Connection Error:', err.message);
      connectionPromise = null; // Reset on failure so we can try again
      throw err;
    }
  })();

  return await connectionPromise;
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
app.use('/api', apiLimiter); // Global Shield
app.use('/api/auth', authLimiter, require('./routes/authRoutes')); // Brute-force Shield
app.use('/api/ai', aiLimiter, require('./routes/aiRoutes')); // AI Cost Shield

app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', announcementRoutes);
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
// ---------------------------------

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

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