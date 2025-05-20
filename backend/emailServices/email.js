import { transporter, sender } from './emailServices.config.js';
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

/**
 * Send verification email
 * @param {string} email - Recipient email address
 * @param {string} verificationToken - Token to be sent
 * @returns {Promise} - Resolves with send info or rejects with error
 */
export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const mailOptions = {
      from: sender,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      headers: {
        'X-Priority': '1',
        'Precedence': 'bulk',
        'X-Category': 'Email Verification'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully", info.messageId);
    return info;

  } catch (error) {
    console.error(`Error sending verification email:`, error);
    throw new Error(`Error sending verification email: ${error.message}`);
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
            <h2>Welcome to Auth Company!</h2>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for joining us! We're excited to have you as a member of our community.</p>
            <p>Your account is now active and you can start using our services right away.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Auth Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: sender,
      to: email,
      subject: "Welcome to Auth Company!",
      html: welcomeTemplate,
      headers: {
        'X-Category': 'Welcome Email'
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully", info.messageId);
    return info;

  } catch (error) {
    console.error(`Error sending welcome email:`, error);
    throw new Error(`Error sending welcome email: ${error.message}`);
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

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully", info.messageId);
    return info;

  } catch (error) {
    console.error(`Error sending password reset email:`, error);
    throw new Error(`Error sending password reset email: ${error.message}`);
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

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset success email sent successfully", info.messageId);
    return info;

  } catch (error) {
    console.error(`Error sending password reset success email:`, error);
    throw new Error(`Error sending password reset success email: ${error.message}`);
  }
};