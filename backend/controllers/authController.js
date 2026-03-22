const Content = require('../models/contentModel');
const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 10. Public Statistics Lena (Home Page ke liye)
exports.getPublicStats = async (req, res) => {
  try {
    // Check if models are available (avoid potential race conditions in serverless)
    if (!Content || !User) {
      throw new Error('Database models were not initialized correctly');
    }

    const contentCount = await Content.countDocuments() || 0;
    const studentCount = await User.countDocuments() || 0;

    // Aggregation for total views
    let totalViews = 0;
    const aggregationStats = await Content.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewsCount' }
        }
      }
    ]);

    if (aggregationStats && aggregationStats.length > 0) {
      totalViews = aggregationStats[0].totalViews || 0;
    }

    res.json({
      contentCount: contentCount + '+',
      studentCount: studentCount + '+',
      viewsCount: totalViews + '+'
    });
  } catch (err) {
    console.error("CRITICAL Public Stats Error:", err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats',
      debug: process.env.NODE_ENV === 'production' ? 'Aggregation or Query Failure' : err.message
    });
  }
};
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
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage || '',
        googleId: user.googleId || null,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 2. User Login Karna (Username, Email, ya Phone se)
exports.loginUser = async (req, res) => {
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
    // Block deleted users
    if (user.isDeleted) {
      return res.status(401).json({ message: 'Your account has been deactivated. Please contact support.' });
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
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage || '',
        googleId: user.googleId || null,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: 'Server error (loginUser): ' + err.message });
  }
};

// ** googleLogin controller with Cloudinary Capture **
exports.googleLogin = async (req, res) => {
  const { email, username, googleId, profileImage: googlePhotoUrl } = req.body;

  try {
    // 1. PROMPT: Check for valid email first
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account must have a valid email to continue.' });
    }

    // 2. Find or Create User
    let user = await User.findOne({ email });

    if (user) {
      // Block deleted users
      if (user.isDeleted) {
        return res.status(401).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
      }
      // Link Google ID if missing
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Create NEW user
      const safeUsername = (username || email.split('@')[0] || 'user').replace(/\s+/g, '').toLowerCase();
      let finalUsername = safeUsername;

      const existingUser = await User.findOne({ username: finalUsername });
      if (existingUser) {
        finalUsername = `${finalUsername}${Math.floor(Math.random() * 1000)}`;
      }

      user = new User({
        username: finalUsername,
        email,
        googleId,
        role: 'student'
      });
      await user.save({ validateBeforeSave: false });
    }

    // 3. CAPTURE Profile Image: If user doesn't have a Cloudinary image, upload the Google one
    if (googlePhotoUrl && (!user.profileImage || !user.profileImage.includes('cloudinary'))) {
      try {
        const highResUrl = googlePhotoUrl.replace('=s96-c', '=s400-c'); // Get better quality
        const result = await cloudinary.uploader.upload(highResUrl, {
          folder: 'gyanstack_profiles',
          width: 250,
          height: 250,
          crop: 'fill',
          gravity: 'face'
        });
        user.profileImage = result.secure_url;
        await user.save({ validateBeforeSave: false });
        console.log("Captured Google profile image into Cloudinary");
      } catch (uploadErr) {
        console.warn("Failed to capture Google photo, using default/existing:", uploadErr.message);
      }
    }

    // 4. Generate Token & Send FULL User Info
    const token = generateToken(user._id);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        profileImage: user.profileImage || '',
        googleId: user.googleId || null,
        createdAt: user.createdAt,
        savedContentCount: user.savedContent ? user.savedContent.length : 0
      },
    });

  } catch (err) {
    console.error("CRITICAL Google Login Error:", err);
    res.status(500).json({
      success: false,
      message: 'Google login failed on server. ' + err.message
    });
  }
};

// 3. Forgot Password (OTP Bhejna)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found or account deactivated' });
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

// 5. User ki Profile Lena (Login ke baad/Refresh par)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage || '',
      googleId: user.googleId || null,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("getUserProfile Error:", err.message);
    res.status(500).send('Server error');
  }
};

// 6. User ka Saved Content Lena
exports.getSavedContent = async (req, res) => {
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

// 7. User ki Profile Update Karna (Dashboard se)
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, phone, removeProfileImage } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username !== user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
      if (usernameExists) return res.status(400).json({ message: 'Username is already taken' });
      user.username = username;
    }
    if (phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
      if (phoneExists) return res.status(400).json({ message: 'Phone number is already taken' });
      user.phone = phone;
    }

    // --- HANDLE PROFILE IMAGE REMOVAL ---
    if (removeProfileImage === 'true' && user.profileImage) {
      try {
        const parts = user.profileImage.split('/');
        const fileName = parts[parts.length - 1].split('.')[0];
        const publicId = `gyanstack_profiles/${fileName}`;
        await cloudinary.uploader.destroy(publicId);
        user.profileImage = null; // Profile photo ko null karke hatayein
        console.log(`Cloudinary image removed: ${publicId}`);
      } catch (err) {
        console.warn("Cloudinary removal failed:", err.message);
      }
    }

    // --- HANDLE NEW IMAGE UPLOAD ---
    if (req.file) {
      try {
        // Agar purana image hai to pehle use hatayein
        if (user.profileImage) {
          const parts = user.profileImage.split('/');
          const fileName = parts[parts.length - 1].split('.')[0];
          const publicId = `gyanstack_profiles/${fileName}`;
          await cloudinary.uploader.destroy(publicId);
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'gyanstack_profiles',
          width: 250,
          height: 250,
          crop: 'fill',
          gravity: 'face'
        });
        user.profileImage = result.secure_url;
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch (uploadErr) {
        console.error("Profile Image Upload Error:", uploadErr);
      }
    }
    const updatedUser = await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage || '',
        googleId: updatedUser.googleId || null,
        createdAt: updatedUser.createdAt
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
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }
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
    const contentId = req.params.id;
    const userId = req.user.id;
    const user = await User.findById(userId);
    const content = await Content.findById(contentId);
    if (!user || !content) {
      return res.status(404).json({ message: 'User or Content not found' });
    }
    const isSavedOnUser = user.savedContent.includes(contentId);
    if (isSavedOnUser) {
      user.savedContent.pull(contentId);
      content.savedBy.pull(userId);
      content.savesCount = Math.max(0, content.savesCount - 1);
    } else {
      user.savedContent.push(contentId);
      content.savedBy.push(userId);
      content.savesCount += 1;
    }
    await user.save({ validateBeforeSave: false });
    await content.save();
    res.status(200).json({
      isSaved: !isSavedOnUser,
      savesCount: content.savesCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error (toggleSaveContent)');
  }
};

// 11. Public Uploader Profile (Har koi dekh sake)
exports.getPublicUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('username email phone role createdAt profileImage');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const contents = await Content.find({ uploadedBy: userId }).sort({ createdAt: -1 });
    res.json({ user, contents });
  } catch (err) {
    console.error("Public Profile Error:", err.message);
    res.status(500).json({ message: 'Server error while fetching uploader profile' });
  }
};

// 12. Top Uploaders Lena (Home Page ke liye)
exports.getTopUploaders = async (req, res) => {
  try {
    const topUploaders = await Content.aggregate([
      { $group: { _id: '$uploadedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: 1,
          count: 1,
          username: '$userDetails.username',
          profileImage: '$userDetails.profileImage',
          role: '$userDetails.role'
        }
      }
    ]);
    res.json({ uploaders: topUploaders });
  } catch (err) {
    console.error("Top Uploaders Error:", err.message);
    res.status(500).json({ message: 'Server error while fetching uploaders' });
  }
};

// 13. Update FCM Token for Push Notifications
exports.updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM Token is required'
      });
    }

    // req.user.id is available from the authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update the token
    user.fcmToken = fcmToken;

    // Use validateBeforeSave: false to avoid password validation issues 
    // when just updating the token
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'FCM Token updated successfully'
    });
  } catch (err) {
    console.error("updateFCMToken Error:", err.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating FCM token'
    });
  }
};