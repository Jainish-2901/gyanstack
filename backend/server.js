// server.js (Hamara main backend server)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const announcementRoutes = require('./routes/announcementRoutes'); // <-- NAYA IMPORT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); 
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI; 
if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

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

// Server ko start karein
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});