const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'superadmin'],
    default: 'student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Forgot Password ke liye
  resetPasswordOtp: String,
  resetPasswordExpire: Date,

  savedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content' // 'Content' model ka reference
  }]
});

// Password Hash karne ke liye (automatic)
// User save hone se pehle, yeh function chalega
userSchema.pre('save', async function (next) {
  // Agar password modify nahi hua hai (jaise role change), toh hashing na karein
  if (!this.isModified('password')) {
    return next();
  }

  // Password ko hash karein
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password compare karne ke liye function
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;