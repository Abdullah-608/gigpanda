import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Middleware to protect routes that require authentication
export const protectRoute = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, please login' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    // Find the user and exclude password
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your email first' 
      });
    }

    // Attach user and userId to request
    req.user = user;
    req.userId = decoded.userId;
    
    // Generate a new token to reset expiry
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set the new token in cookie
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
      domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      // Clear the invalid token cookie
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
        domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined
      });
      
      return res.status(401).json({ 
        success: false, 
        message: 'Token is invalid or expired, please login again' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
}; 