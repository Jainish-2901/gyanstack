const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Transporter banayein (Gmail use karke)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // .env file se aayega
      pass: process.env.GMAIL_APP_PASS, // .env file se aayega
    },
  });

  // 2. Email options define karein
  const mailOptions = {
    from: `GyanStack <${process.env.GMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Email bhej dein
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;