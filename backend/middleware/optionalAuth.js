const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.error("Optional Auth Error:", error.message);
      // We don't block here, just move on without req.user
    }
  }
  next();
};

module.exports = optionalAuth;
