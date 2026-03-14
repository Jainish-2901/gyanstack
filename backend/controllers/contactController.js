const Contact = require('../models/contactModel');
const nodemailer = require('nodemailer');

// 1. Submit Contact Form (Public)
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message, userId } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
      user: userId || (req.user ? req.user.id : null),
    });

    await newContact.save();

    // Send Email to Admin
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`, // Show user's name and email as sender
      to: process.env.GMAIL_USER, 
      replyTo: email, // Allow admin to reply directly
      subject: `[GyanStack] New Contact Form Inquiry from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #0d6efd;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr);
      // We don't fail the entire request if email sending fails
    }

    res.status(201).json({ message: "Your message has been sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Get All Contact List (Admin/SuperAdmin)
exports.getContactMessages = async (req, res) => {
  try {
    // Only Admin or SuperAdmin should hit this route via middleware
    const messages = await Contact.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Update Status (Admin)
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found." });
    res.status(200).json({ message: "Status updated successfully!", data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Delete Message (Admin)
exports.deleteMessage = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Get Logged-in User's Inquiries
exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Contact.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ inquiries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
