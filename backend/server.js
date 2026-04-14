
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const announcementRoutes = require('./routes/announcementRoutes');

dotenv.config();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 50 : 1000,
  message: { message: "Too many login/signup attempts. Please wait 15 minutes." },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "AI daily limit reached for this session. Please try again later." },
});

require('./models/userModel');
require('./models/contentModel');
require('./models/categoryModel');
require('./models/announcementModel');
require('./models/subscriptionModel');
require('./models/requestModel');
require('./models/contactModel');

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 5000;

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

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    next();
  });
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let cachedConnection = null;
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (connectionPromise) return connectionPromise;

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in environment variables');
  }

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        family: 4,
        bufferCommands: true,
      });


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
      connectionPromise = null;
      throw err;
    }
  })();

  return await connectionPromise;
};

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

app.get('/', (req, res) => {
  res.send('GyanStack Backend API is running... Status: OK');
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/ai', aiLimiter, require('./routes/aiRoutes'));

app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', announcementRoutes);
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
  });
  server.timeout = 600000;
}

module.exports = app;