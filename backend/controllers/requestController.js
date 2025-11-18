const Request = require('../models/requestModel');

// 1. Nayi Request Banana (User Only)
exports.createRequest = async (req, res) => {
  const { topic, message } = req.body;
  try {
    const newRequest = new Request({
      topic,
      message,
      requestedBy: req.user.id,
    });
    await newRequest.save();
    res.status(201).json({ message: 'Request submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 2. Sabhi Requests Lena (Admin Only)
exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' })
      .populate('requestedBy', 'username email') // User ki details fetch karein
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};