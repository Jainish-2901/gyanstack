const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  let token;

  // Header check karein (format: 'Bearer <token>')
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token nikalein
      token = req.headers.authorization.split(' ')[1];

      // Token verify karein
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ki ID ko request object mein add karein (password chhod kar)
      req.user = await User.findById(decoded.id).select('-password');
      
      next(); // Agle step par jaane dein
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = authMiddleware;