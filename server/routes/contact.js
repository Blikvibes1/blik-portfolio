// routes/contact.js — POST /api/contact
// Validates input, sends email via Resend/Nodemailer, returns terminal-styled JSON.

const express = require('express');
const router = express.Router();

// npm install resend  (or use nodemailer if you prefer SMTP)
// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'TRANSMISSION_FAILED :: name, email, and message are required.'
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'TRANSMISSION_FAILED :: invalid email format.'
      });
    }
    if (message.length > 5000) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'TRANSMISSION_FAILED :: message exceeds max length.'
      });
    }

    // Example send via Resend (uncomment + configure to go live):
    // await resend.emails.send({
    //   from: 'BLIK Terminal <noreply@josephagyei.com>',
    //   to: 'joseph@josephagyei.com',
    //   subject: `New transmission from ${name}`,
    //   text: `From: ${name} <${email}>\n\n${message}`
    // });

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'TRANSMISSION COMPLETE :: message received, response window 24-48h.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'ERROR', message: 'INTERNAL_SYSTEM_FAULT :: try again later.' });
  }
});

module.exports = router;
