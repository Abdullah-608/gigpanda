import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

// Create or update user profile
export const createUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { personal, professional, userType } = req.body;

    if (!personal || (userType !== 'client' && userType !== 'freelancer')) {
      return res.status(400).json({ error: 'Missing required profile information' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's profile
    user.name = personal.name || user.name;
    user.role = userType;
    
    // Add profile fields
    user.profile = {
      bio: personal.bio || '',
      country: personal.country || '',
      pictureUrl: personal.pictureUrl || '',
      languages: Array.isArray(personal.languages) ? personal.languages : ['English'],
      
      // Professional info based on user type
      ...(userType === 'freelancer' ? {
        skills: Array.isArray(professional?.skills) ? professional.skills : [],
        education: Array.isArray(professional?.education) ? professional.education : [],
        certifications: Array.isArray(professional?.certifications) ? professional.certifications : []
      } : {
        companyName: professional?.companyName || '',
        companyInfo: professional?.companyInfo || '',
        companyLink: professional?.companyLink || '',
        pastProjects: Array.isArray(professional?.pastProjects) ? professional.pastProjects : []
      })
    };

    // Save the updated user
    await user.save();

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find the user by ID and exclude password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile || {}
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
}; 