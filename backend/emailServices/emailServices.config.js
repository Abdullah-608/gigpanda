import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Build transporter configuration
let transporterConfig = {
  // Connection timeout in milliseconds (10 seconds - faster failure)
  connectionTimeout: 10000,
  // Socket timeout in milliseconds (20 seconds - enough for most operations)
  socketTimeout: 20000,
  // Greeting timeout in milliseconds (5 seconds)
  greetingTimeout: 5000,
  // Retry attempts
  maxConnections: 3, // Reduced from 5 to avoid connection issues
  maxMessages: 10, // Reduced from 100 - send fewer messages per connection
  // Pool connections
  pool: true,
  // Rate limiting - reduced to avoid overwhelming server
  rateDelta: 2000, // Increased time between rate limit checks
  rateLimit: 3, // Reduced concurrent sends
  // Connection pool cleanup
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  // TLS configuration - more permissive for cloud platforms
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
    minVersion: 'TLSv1.2'
  },
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
};

// Support both service-based and host/port-based configurations
if (process.env.EMAIL_SERVICE) {
  // Use service name (Gmail, Outlook, etc.)
  transporterConfig.service = process.env.EMAIL_SERVICE;
  console.log(`📧 Email service configured: ${process.env.EMAIL_SERVICE}`);
  console.log(`📧 Email username: ${process.env.EMAIL_USERNAME ? process.env.EMAIL_USERNAME.substring(0, 3) + '***' : 'NOT SET'}`);
  console.log(`📧 Email password: ${process.env.EMAIL_APP_PASSWORD ? '***SET***' : 'NOT SET'}`);
} else if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
  // Use explicit host and port
  transporterConfig.host = process.env.EMAIL_HOST;
  transporterConfig.port = parseInt(process.env.EMAIL_PORT, 10);
  transporterConfig.secure = process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465';
  console.log(`📧 Email SMTP configured: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  console.log(`📧 Secure connection: ${transporterConfig.secure}`);
  console.log(`📧 Email username: ${process.env.EMAIL_USERNAME ? process.env.EMAIL_USERNAME.substring(0, 3) + '***' : 'NOT SET'}`);
} else {
  console.error('❌ Email configuration incomplete. Either EMAIL_SERVICE or EMAIL_HOST/EMAIL_PORT must be set.');
  console.error('❌ Email functionality will not work until configured properly.');
}

// Create reusable transporter
const transporter = nodemailer.createTransport(transporterConfig);

// Handle connection pool errors gracefully
transporter.on('idle', () => {
  // All connections are busy, wait a bit before trying again
  console.log('📧 Email connection pool: all connections in use');
});

transporter.on('error', (error) => {
  // Log connection errors but don't crash
  console.error('📧 Email transporter error:', error.message);
  // Don't log full error in production to avoid leaking sensitive info
  if (process.env.NODE_ENV === 'development') {
    console.error('📧 Full error:', error);
  }
});

// Graceful shutdown handler - close transporter connections
const closeTransporter = async () => {
  try {
    transporter.close();
    console.log('📧 Email transporter closed successfully');
  } catch (error) {
    console.error('📧 Error closing email transporter:', error.message);
  }
};

// Handle process termination gracefully
process.on('SIGTERM', closeTransporter);
process.on('SIGINT', closeTransporter);

// Verify connection asynchronously (non-blocking)
// This won't block server startup if email service is unavailable
const verifyEmailConnection = async () => {
  try {
    // Set a timeout for verification
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Verification timeout')), 10000)
    );
    
    await Promise.race([verifyPromise, timeoutPromise]);
    console.log('✓ Email server connection established');
  } catch (error) {
    // Log warning but don't crash the app
    console.warn('⚠ Email server connection verification failed:', error.message);
    console.warn('⚠ Email functionality may be limited. Check your email configuration.');
  }
};

// Verify connection in background (non-blocking)
verifyEmailConnection();

// Format sender with name
const sender = `"${process.env.EMAIL_SENDER_NAME || 'GigPanda'}" <${process.env.EMAIL_USERNAME}>`;

// Log sender configuration
if (process.env.EMAIL_USERNAME) {
  console.log(`📧 Email sender: ${sender}`);
} else {
  console.error('❌ EMAIL_USERNAME is not set. Emails will not be sent.');
}

export { transporter, sender };