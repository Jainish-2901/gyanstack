const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Changed to false for external messages
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sentCount: {
    type: Number,
    default: 0
  },
  openCount: {
    type: Number,
    default: 0
  }
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;