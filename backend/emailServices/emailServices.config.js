import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Determine if we're in production (deployment environment)
const isProduction = process.env.NODE_ENV === 'production';

// Build transporter configuration
let transporterConfig = {
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

// Configure timeouts based on environment
if (isProduction) {
  // Production: Longer timeouts for deployment environments (network latency, firewall delays)
  transporterConfig.connectionTimeout = 30000; // 30 seconds
  transporterConfig.socketTimeout = 30000; // 30 seconds
  transporterConfig.greetingTimeout = 10000; // 10 seconds
} else {
  // Development: Faster timeouts for local testing
  transporterConfig.connectionTimeout = 10000; // 10 seconds
  transporterConfig.socketTimeout = 20000; // 20 seconds
  transporterConfig.greetingTimeout = 5000; // 5 seconds
}

// Connection pooling works well locally but can cause issues in deployment
// Disable pooling in production for better reliability
if (isProduction) {
  // Production: Use direct connections (no pooling) for better reliability in cloud environments
  transporterConfig.pool = false;
  console.log('📧 Email configuration: Direct connections (pooling disabled for deployment)');
} else {
  // Development: Use connection pooling for efficiency
  transporterConfig.pool = true;
  transporterConfig.maxConnections = 3;
  transporterConfig.maxMessages = 10;
  transporterConfig.rateDelta = 2000;
  transporterConfig.rateLimit = 3;
  console.log('📧 Email configuration: Connection pooling enabled (development mode)');
}

// Support both service-based and host/port-based configurations
// For deployment reliability, prefer explicit host/port configuration
if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
  // Use explicit host and port (most reliable for deployment)
  transporterConfig.host = process.env.EMAIL_HOST;
  transporterConfig.port = parseInt(process.env.EMAIL_PORT, 10);
  transporterConfig.secure = process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465';
  
  // For Gmail, use STARTTLS on port 587 (more reliable than SSL on 465 in cloud environments)
  if (process.env.EMAIL_HOST === 'smtp.gmail.com' && parseInt(process.env.EMAIL_PORT) === 587) {
    transporterConfig.secure = false; // Use STARTTLS instead of direct SSL
    transporterConfig.requireTLS = true;
  }
  
  console.log(`📧 Email SMTP configured: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  console.log(`📧 Secure connection: ${transporterConfig.secure ? 'SSL/TLS' : 'STARTTLS'}`);
  console.log(`📧 Email username: ${process.env.EMAIL_USERNAME ? process.env.EMAIL_USERNAME.substring(0, 3) + '***' : 'NOT SET'}`);
  console.log(`📧 Email password: ${process.env.EMAIL_APP_PASSWORD ? '***SET***' : 'NOT SET'}`);
} else if (process.env.EMAIL_SERVICE) {
  // Use service name (Gmail, Outlook, etc.) - fallback option
  transporterConfig.service = process.env.EMAIL_SERVICE;
  
  // For Gmail service, override with explicit configuration for better reliability in deployment
  if (process.env.EMAIL_SERVICE.toLowerCase() === 'gmail' && isProduction) {
    transporterConfig.host = 'smtp.gmail.com';
    transporterConfig.port = 587;
    transporterConfig.secure = false;
    transporterConfig.requireTLS = true;
    delete transporterConfig.service; // Remove service to use explicit host/port
    console.log(`📧 Gmail service detected - using explicit SMTP configuration for deployment reliability`);
  }
  
  console.log(`📧 Email service configured: ${process.env.EMAIL_SERVICE}`);
  console.log(`📧 Email username: ${process.env.EMAIL_USERNAME ? process.env.EMAIL_USERNAME.substring(0, 3) + '***' : 'NOT SET'}`);
  console.log(`📧 Email password: ${process.env.EMAIL_APP_PASSWORD ? '***SET***' : 'NOT SET'}`);
} else {
  console.error('❌ Email configuration incomplete. Either EMAIL_SERVICE or EMAIL_HOST/EMAIL_PORT must be set.');
  console.error('❌ For deployment, it is recommended to use EMAIL_HOST=smtp.gmail.com and EMAIL_PORT=587');
  console.error('❌ Email functionality will not work until configured properly.');
}

// Create reusable transporter
const transporter = nodemailer.createTransport(transporterConfig);

// Handle connection errors gracefully
if (isProduction) {
  // In production, log errors with more detail for debugging
  transporter.on('error', (error) => {
    console.error('📧 Email transporter error:', error.message);
    console.error('📧 Error code:', error.code);
    console.error('📧 Error command:', error.command);
  });
} else {
  // In development, use pooling event handlers
  transporter.on('idle', () => {
    console.log('📧 Email connection pool: all connections in use');
  });

  transporter.on('error', (error) => {
    console.error('📧 Email transporter error:', error.message);
    console.error('📧 Full error:', error);
  });
}

// Graceful shutdown handler - close transporter connections (only needed for pooling)
const closeTransporter = async () => {
  try {
    if (transporterConfig.pool) {
      transporter.close();
      console.log('📧 Email transporter closed successfully');
    }
  } catch (error) {
    console.error('📧 Error closing email transporter:', error.message);
  }
};

// Handle process termination gracefully (only register if using pooling)
if (transporterConfig.pool) {
  process.on('SIGTERM', closeTransporter);
  process.on('SIGINT', closeTransporter);
}

// Verify connection asynchronously (non-blocking)
// This won't block server startup if email service is unavailable
const verifyEmailConnection = async () => {
  try {
    // Use longer timeout in production for verification
    const verificationTimeout = isProduction ? 35000 : 10000;
    
    // Set a timeout for verification
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Verification timeout')), verificationTimeout)
    );
    
    await Promise.race([verifyPromise, timeoutPromise]);
    console.log('✓ Email server connection verified successfully');
    console.log(`✓ Email configuration: ${transporterConfig.pool ? 'Connection pooling enabled' : 'Direct connections (no pooling)'}`);
  } catch (error) {
    // Log warning but don't crash the app
    console.warn('⚠ Email server connection verification failed:', error.message);
    if (error.code) {
      console.warn(`⚠ Error code: ${error.code}`);
    }
    if (isProduction) {
      console.warn('⚠ This may be due to network restrictions in your deployment environment.');
      console.warn('⚠ Render may block outbound SMTP connections - check your Render service settings.');
      console.warn('⚠ Emails will still attempt to send, but may fail if SMTP is blocked.');
    } else {
      console.warn('⚠ Email functionality may be limited. Check your email configuration.');
    }
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