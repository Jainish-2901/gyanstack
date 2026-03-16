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
    const requests = await Request.find()
      .populate('requestedBy', 'username email phone') // User ki details fetch karein
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 3. Request Status Update Karna (Admin Only)
exports.updateRequestStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request status updated', request });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 4. User Apni Requests Lena (User Only)
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requestedBy: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 5. Request Delete Karna (Admin Only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Request deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};