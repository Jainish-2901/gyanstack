// --- FIX YAHIN HAI ---
// 'Content' model ko pehle import karein taaki Mongoose use register kar le
require('../models/contentModel'); 
// ---------------------

const User = require('../models/userModel'); // Ab yeh line error nahi degi
const sendEmail = require('../services/mailService');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// JWT Token generate karne ka helper function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// 1. Naya User Register Karna
exports.registerUser = async (req, res) => {
  // (Yeh code pehle jaisa hi hai)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, phone, password, role } = req.body;
  try {
    let user = await User.findOne({ $or: [{ email }, { username }, { phone }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email, username, or phone' });
    }
    user = new User({
      username,
      email,
      phone,
      password,
      role: role || 'student',
    });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 2. User Login Karna (Username, Email, ya Phone se)
exports.loginUser = async (req, res) => {
  // (Yeh code pehle jaisa hi hai)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { loginId, password } = req.body;
  try {
    let user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }, { phone: loginId }],
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 3. Forgot Password (OTP Bhejna)
exports.forgotPassword = async (req, res) => {
  // (Yeh code pehle jaisa hi hai)
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });
    const message = `Your OTP for GyanStack password reset is: \n\n ${otp} \n\nIf you did not request this, please ignore this email.`;
    await sendEmail({
      email: user.email,
      subject: 'GyanStack Password Reset OTP',
      message,
    });
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err.message);
    // OTP fields clear karein agar error aaye
    const user = await User.findOne({ email });
    if (user) {
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
    }
    res.status(500).send('Email could not be sent');
  }
};

// 4. Reset Password (OTP Verify Karke)
exports.resetPassword = async (req, res) => {
  // (Yeh code pehle jaisa hi hai)
  const { otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordOtp: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 5. User ki Profile Lena (Login ke baad)
exports.getUserProfile = async (req, res) => {
  // (Yeh code pehle jaisa hi hai)
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 6. User ka Saved Content Lena
exports.getSavedContent = async (req, res) => {
  // (Yeh code pehle jaisa hi hai)
  try {
    const user = await User.findById(req.user.id).populate('savedContent');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ savedContent: user.savedContent });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// --- YEH NAYE FUNCTIONS HAIN ---

// 7. User ki Profile Update Karna (Dashboard se)
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, phone } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check karein ki naya username/phone pehle se exist karta hai (kisi *aur* user ke liye)
    if (username !== user.username) {
        const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
        user.username = username;
    }
    if (phone !== user.phone) {
        const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
        if (phoneExists) {
            return res.status(400).json({ message: 'Phone number is already taken' });
        }
        user.phone = phone;
    }

    const updatedUser = await user.save({ validateBeforeSave: false });
    
    // Naya (updated) user data token ke saath bhejein
    const token = generateToken(user._id);

    res.json({
        token,
        user: {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
        },
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 8. Password Change Karna (Dashboard se)
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    // Current password check karein
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Naya password set karein (yeh automatic hash ho jaayega)
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 9. Content ko Save/Unsave Karna (Bookmark Toggle)
exports.toggleSaveContent = async (req, res) => {
  try {
    const contentId = req.params.id; // Content ki ID
    const userId = req.user.id; // Logged-in user ki ID
    
    // Content aur User dono documents ko fetch karein
    const user = await User.findById(userId);
    const content = await Content.findById(contentId);

    if (!user || !content) {
      return res.status(404).json({ message: 'User or Content not found' });
    }

    const isSavedOnUser = user.savedContent.includes(contentId);
    const isSavedOnContent = content.savedBy.includes(userId);

    if (isSavedOnUser) {
      // --- UNSAVE LOGIC ---
      // 1. User: contentId ko savedContent array se hatayein
      user.savedContent.pull(contentId);
      
      // 2. Content: userId ko savedBy array se hatayein aur count ghata dein
      content.savedBy.pull(userId);
      content.savesCount = Math.max(0, content.savesCount - 1);
    } else {
      // --- SAVE LOGIC ---
      // 1. User: contentId ko savedContent array mein jodein
      user.savedContent.push(contentId);
      
      // 2. Content: userId ko savedBy array mein jodein aur count badhayein
      content.savedBy.push(userId);
      content.savesCount += 1;
    }

    // Dono documents ko save karein
    await user.save({ validateBeforeSave: false }); 
    await content.save();
    
    // Frontend ko naya status return karein
    res.status(200).json({ 
        isSaved: !isSavedOnUser,
        savesCount: content.savesCount
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error (toggleSaveContent)');
  }
};