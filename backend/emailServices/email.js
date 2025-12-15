import { transporter, sender } from './emailServices.config.js';
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

/**
 * Send email with timeout protection and retry logic
 * @param {Object} mailOptions - Nodemailer mail options
 * @param {number} timeoutMs - Timeout in milliseconds (default 15000 for dev, 30000 for prod)
 * @param {number} maxRetries - Maximum number of retry attempts (default 2)
 * @returns {Promise} - Resolves with send info or rejects with error
 */
const sendEmailWithTimeout = async (mailOptions, timeoutMs = null, maxRetries = 2) => {
  // Use longer timeout in production
  if (!timeoutMs) {
    timeoutMs = process.env.NODE_ENV === 'production' ? 35000 : 15000;
  }

  const attemptSend = async (attemptNumber) => {
    try {
      const sendPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Email send timeout after ${timeoutMs / 1000} seconds`)), timeoutMs)
      );

      const info = await Promise.race([sendPromise, timeoutPromise]);
      return info;
    } catch (error) {
      // Check if it's a retryable error
      const isRetryable = error.code === 'ETIMEDOUT' || 
                         error.code === 'ECONNRESET' || 
                         error.code === 'ECONNREFUSED' ||
                         error.code === 'ESOCKETTIMEDOUT' ||
                         error.message.includes('timeout') ||
                         error.message.includes('Connection');

      if (isRetryable && attemptNumber < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attemptNumber), 5000); // Exponential backoff, max 5s
        console.warn(`⚠ Email send attempt ${attemptNumber} failed (${error.message}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptSend(attemptNumber + 1);
      }

      throw error;
    }
  };

  try {
    return await attemptSend(1);
  } catch (error) {
    // If timeout occurs, check if email was actually sent
    if (error.message.includes('timeout')) {
      console.warn('⚠ Email send timed out after all retries - connection may be blocked by deployment environment');
    }
    throw error;
  }
};

/**
 * Send verification email
 * @param {string} email - Recipient email address
 * @param {string} verificationToken - Token to be sent
 * @returns {Promise} - Resolves with send info or rejects with error
 */
export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error(`Invalid email format: ${email}`);
      return null;
    }

    const mailOptions = {
      from: sender,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      headers: {
        'X-Priority': '1',
        'X-Category': 'Email Verification'
        // Removed 'Precedence: bulk' as it can cause emails to be marked as spam
      }
    };

    console.log(`Attempting to send verification email to: ${email}`);
    console.log(`From: ${sender}`);

    // Send email with timeout protection
    const info = await sendEmailWithTimeout(mailOptions, 15000);
    
    // Log detailed response
    console.log("=== Email Send Response ===");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("Pending:", info.pending);
    console.log("===========================");
    
    // Check if email was actually accepted
    if (info.rejected && info.rejected.length > 0) {
      console.error(`Email was rejected by server:`, info.rejected);
      return null;
    }
    
    if (!info.messageId) {
      console.warn("Email sent but no message ID returned - may not have been delivered");
    }

    return info;

  } catch (error) {
    console.error(`❌ Error sending verification email to ${email}:`, error.message);
    if (error.code) {
      console.error(`❌ Error code: ${error.code}`);
    }
    if (error.command) {
      console.error(`❌ Failed command: ${error.command}`);
    }
    if (error.response) {
      console.error(`❌ SMTP response: ${error.response}`);
    }
    if (process.env.NODE_ENV === 'development') {
      console.error("Full error:", error);
    }
    // Don't throw - log and return null so the app can continue
    return null;
  }
};

/**
 * Send welcome email
 * @param {string} email - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise} - Resolves with send info or rejects with error
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    // Since we don't have template_uuid functionality in Nodemailer,
    // we'll need to create a welcome email template
    const welcomeTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Welcome to GigPanda!</h2>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for joining us! We're excited to have you as a member of our community.</p>
            <p>Your account is now active and you can start using our services right away.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The GigPanda Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} GigPanda. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: sender,
      to: email,
      subject: "Welcome to GigPanda!",
      html: welcomeTemplate,
      headers: {
        'X-Category': 'Welcome Email'
      }
    };

    // Send email with timeout protection
    const info = await sendEmailWithTimeout(mailOptions, 15000);
    console.log("Welcome email sent successfully", info.messageId);
    return info;

  } catch (error) {
    console.error(`❌ Error sending welcome email to ${email}:`, error.message);
    if (error.code) {
      console.error(`❌ Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`❌ SMTP response: ${error.response}`);
    }
    if (process.env.NODE_ENV === 'development') {
      console.error("Full error:", error);
    }
    // Don't throw - log and return null so the app can continue
    return null;
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} resetURL - Password reset URL
 * @returns {Promise} - Resolves with send info or rejects with error
 */
export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error(`Invalid email format: ${email}`);
      return null;
    }

    const mailOptions = {
      from: sender,
      to: email,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      headers: {
        'X-Priority': '1',
        'X-Category': 'Password Reset'
      }
    };

    console.log(`Attempting to send password reset email to: ${email}`);

    // Send email with timeout protection
    const info = await sendEmailWithTimeout(mailOptions, 15000);
    
    // Log detailed response
    console.log("=== Password Reset Email Response ===");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("====================================");
    
    // Check if email was actually accepted
    if (info.rejected && info.rejected.length > 0) {
      console.error(`Email was rejected by server:`, info.rejected);
      return null;
    }

    return info;

  } catch (error) {
    console.error(`❌ Error sending password reset email to ${email}:`, error.message);
    if (error.code) {
      console.error(`❌ Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`❌ SMTP response: ${error.response}`);
    }
    if (process.env.NODE_ENV === 'development') {
      console.error("Full error:", error);
    }
    return null;
  }
};

/**
 * Send password reset success email
 * @param {string} email - Recipient email address
 * @returns {Promise} - Resolves with send info or rejects with error
 */
export const sendResetSuccessEmail = async (email) => {
  try {
    const mailOptions = {
      from: sender,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      headers: {
        'X-Category': 'Password Reset'
      }
    };

    // Send email with timeout protection
    const info = await sendEmailWithTimeout(mailOptions, 15000);
    console.log("Password reset success email sent successfully", info.messageId);
    return info;

  } catch (error) {
    console.error(`❌ Error sending password reset success email to ${email}:`, error.message);
    if (error.code) {
      console.error(`❌ Error code: ${error.code}`);
    }
    if (error.response) {
      console.error(`❌ SMTP response: ${error.response}`);
    }
    if (process.env.NODE_ENV === 'development') {
      console.error("Full error:", error);
    }
    // Don't throw - log and return null so the app can continue
    return null;
  }
};