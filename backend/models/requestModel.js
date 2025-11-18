const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Request = mongoose.model('Request', requestSchema);
module.exports = Request;