import User from '../models/user.model.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookies } from '../utils/generateTokenAndSetCookies.js';
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail,sendResetSuccessEmail } from '../emailServices/email.js';
import jwt from 'jsonwebtoken';

/**     
 * User Signup Controller
 * -----------------------
 * Registers a new user in the system
 * Steps:
 * 1. Validate required fields
 * 2. Check if user already exists
 * 3. Hash the password
 * 4. Generate verification token
 * 5. Create and save new user
 * 6. Generate JWT token and set cookies
 * 7. Return success response
 */
export const Signup = async (req, res) => {
  // Extract user data from request body
  const { email, name, password, role } = req.body;
  
  try {
    // Validate that all required fields are provided
    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Check if user with this email already exists
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a 6-digit verification token for email verification
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create new user object with all required fields
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours validity
    });

    // Save the user to the database
    await user.save();

    // Generate JWT token and set it in cookies
    generateTokenAndSetCookies(res, user._id);

    sendVerificationEmail(user.email,verificationToken);

    // Send success response with user data (excluding password)
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        // Include other user properties as needed, but exclude sensitive data
      },
    });
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const Signin =async (req,res)=>{
    const {email,password}= req.body
    try {
      const user = await User.findOne({email});
      if(!user){
        return res.status(400).json({success:false,message:"Invalid Credentials"});
      }
      const isPasswordValid = await bcrypt.compare(password,user.password);
      if(!isPasswordValid){
        return res.status(400).json({success:false,message:"Invalid Credentials"});
      }
      
      generateTokenAndSetCookies(res,user._id);
      user.lastLogin=Date.now();

      await user.save();

      res.status(200).json({
        success:true,
        message:"Logged in Successfully",
        user:{
          ...user._doc,
          password:undefined
        },
      });

    } catch (error) {
      console.log("Error in log in Function",error)
      res.status(500).json({
        success:false,
        message:"An error occurred during login"
      });
    }
}

export const Logout =async (req,res)=>{
    res.clearCookie("token");
    res.status(200).json({success:true,message:"Logged out Successfully"});
}

export const verifyEmail = async(req,res)=>{
  const {code}=req.body;
  try {
    const user=await User.findOne({
      verificationToken:code,
      verificationTokenExpiresAt:{$gt:Date.now() }
    })
    if(!user)
    {
      return res.status(400).json({success:false,message:"Invalid or expired Verification Code"})
    }

    user.isVerified=true
    user.verificationToken=undefined;
    user.verificationTokenExpiresAt=undefined
    await user.save();

    // Generate new JWT token and set cookies after successful verification
    generateTokenAndSetCookies(res, user._id);

    await sendWelcomeEmail(user.email,user.name);

    res.status(200).json({
      success:true,
      message:"Email Verified SuccessFully",
      user:{
        ...user._doc,
        password:undefined,
      }
    })
    
  } catch (error) {
    console.log("Error in Verifying Email",error)
    res.status(500).json({success:false,message:"Server error"})
  }
}

export const resendVerification = async(req, res) => {
  try {
    // Extract token from cookies
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // If user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }
    
    // Generate a new 6-digit verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update user with new verification token
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity
    
    await user.save();
    
    // Send new verification email
    await sendVerificationEmail(user.email, verificationToken);
    
    res.status(200).json({
      success: true,
      message: "Verification code has been resent to your email"
    });
    
  } catch (error) {
    console.log("Error in Resending Verification Email", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending verification code"
    });
  }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate reset token and set expiry (1 hour)
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;

    // Update user with reset token information
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Send password reset email
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, resetURL);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      // Don't include the actual token in the response for security
      expiresAt: new Date(resetTokenExpiresAt).toISOString()
    });
    
  } catch (error) {
    console.error("Forgot password error:", error);
    
    // Handle specific errors first
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message
      });
    }

    // Handle email sending errors
    if (error.message && error.message.includes("Error sending password reset email")) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later."
      });
    }

    // Generic error handler
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate input
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required"
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    // Check if user exists and token is valid
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired"
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    
    // Save the updated user
    await user.save();

    // Optionally send a confirmation email
    await sendResetSuccessEmail(user.email);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message
      });
    }
    
    // Handle general errors
    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};