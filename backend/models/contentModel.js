const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true, 
  },
  url: {
    type: String,
  },
  
  // Ye 'raw', 'image', 'video' ya 'auto' store karega
  fileResourceType: {
    type: String,
    default: 'auto' // 'auto' matlab link ya note
  },

  textNote: {
    type: String,
  },
  categoryId: {
    type: String, 
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
  }],
  viewsCount: {
    type: Number,
    default: 0,
  },

  // --- NAYA FIELD (DOWNLOAD TRACKING KE LIYE) ---
  downloadsCount: {
    type: Number,
    default: 0,
  },
  // ---------------------------------------------
  
  // Like fields
  likesCount: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // --- YEH NAYE FIELDS HAIN (SAVE/BOOKMARK KE LIYE) ---
  savesCount: {
    type: Number,
    default: 0,
  },
  // Yeh array store karega ki kis-kis user ne save kiya hai
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
  // -----------------------------

}, { timestamps: true }); // createdAt aur updatedAt automatic add karega

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;