import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Middleware to protect routes that require authentication
export const protectRoute = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, please login' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Not authorized, invalid token' });
  }
}; 