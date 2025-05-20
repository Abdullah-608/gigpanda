import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

// Verify connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email server connection error:', error);
  } else {
    console.log('Email server connection established',success);
  }
});

// Format sender with name
const sender = `"${process.env.EMAIL_SENDER_NAME || 'GigPanda'}" <${process.env.EMAIL_USERNAME}>`;

export { transporter, sender };