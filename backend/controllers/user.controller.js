import User from '../models/user.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
        profile: user.profile || {},
        totalEarnings: user.totalEarnings || 0,
        activeProjects: user.activeProjects || 0,
        totalOrders: user.totalOrders || 0
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
};

// Update freelancer stats
export const updateFreelancerStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { totalEarnings, activeProjects, totalOrders } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only freelancers can update these stats
    if (user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can update these stats' });
    }

    // Update stats if provided
    if (typeof totalEarnings === 'number') {
      user.totalEarnings = totalEarnings;
    }
    if (typeof activeProjects === 'number') {
      user.activeProjects = activeProjects;
    }
    if (typeof totalOrders === 'number') {
      user.totalOrders = totalOrders;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({ 
      message: 'Stats updated successfully',
      stats: {
        totalEarnings: user.totalEarnings,
        activeProjects: user.activeProjects,
        totalOrders: user.totalOrders
      }
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Server error while updating stats' });
  }
};

// Increment freelancer stats (helper function for internal use)
export const incrementFreelancerStats = async (userId, statType, amount = 1) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'freelancer') {
      return false;
    }

    switch (statType) {
      case 'totalEarnings':
        user.totalEarnings = (user.totalEarnings || 0) + amount;
        break;
      case 'activeProjects':
        user.activeProjects = (user.activeProjects || 0) + amount;
        break;
      case 'totalOrders':
        user.totalOrders = (user.totalOrders || 0) + amount;
        break;
      default:
        return false;
    }

    await user.save();
    return true;
  } catch (error) {
    console.error('Error incrementing stats:', error);
    return false;
  }
};

// Get top freelancers by total orders (for "Hot Freelancers" section)
export const getTopFreelancers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Find freelancers sorted by total orders (descending)
    const topFreelancers = await User.find({ 
      role: 'freelancer'
    })
    .select('name email profile totalOrders totalEarnings')
    .sort({ totalOrders: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      freelancers: topFreelancers.map(freelancer => ({
        id: freelancer._id,
        name: freelancer.name,
        email: freelancer.email,
        avatar: freelancer.profile?.pictureUrl || null,
        bio: freelancer.profile?.bio || '',
        skills: freelancer.profile?.skills || [],
        totalOrders: freelancer.totalOrders || 0,
        totalEarnings: freelancer.totalEarnings || 0,
        country: freelancer.profile?.country || ''
      }))
    });

  } catch (error) {
    console.error('Error fetching top freelancers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching top freelancers' 
    });
  }
};

// Helper function to create test freelancers (for development/testing)
export const createTestFreelancers = async (req, res) => {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ 
        success: false, 
        message: 'Test data creation not allowed in production' 
      });
    }

    const testFreelancers = [
      {
        name: "Alex Rodriguez",
        email: "alex.freelancer@test.com",
        password: "testpass123",
        role: "freelancer",
        isVerified: true,
        totalOrders: 47,
        totalEarnings: 23500,
        activeProjects: 3,
        profile: {
          bio: "Full-stack developer with 5+ years experience",
          skills: ["React", "Node.js", "Python", "AWS"],
          country: "USA"
        }
      },
      {
        name: "Maria Santos",
        email: "maria.freelancer@test.com", 
        password: "testpass123",
        role: "freelancer",
        isVerified: true,
        totalOrders: 63,
        totalEarnings: 31200,
        activeProjects: 2,
        profile: {
          bio: "UI/UX Designer specializing in mobile apps",
          skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
          country: "Spain"
        }
      },
      {
        name: "David Kim",
        email: "david.freelancer@test.com",
        password: "testpass123", 
        role: "freelancer",
        isVerified: true,
        totalOrders: 28,
        totalEarnings: 18900,
        activeProjects: 1,
        profile: {
          bio: "Mobile app developer for iOS and Android",
          skills: ["Swift", "Kotlin", "Flutter", "Firebase"],
          country: "South Korea"
        }
      }
    ];

    const createdFreelancers = [];
    
    for (const freelancerData of testFreelancers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: freelancerData.email });
      if (!existingUser) {
        // Hash password
        const hashedPassword = await bcrypt.hash(freelancerData.password, 10);
        
        const freelancer = new User({
          ...freelancerData,
          password: hashedPassword
        });
        
        await freelancer.save();
        createdFreelancers.push(freelancer.name);
      }
    }

    res.status(200).json({
      success: true,
      message: `Created ${createdFreelancers.length} test freelancers`,
      freelancers: createdFreelancers
    });

  } catch (error) {
    console.error('Error creating test freelancers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating test freelancers' 
    });
  }
};

// Debug function to check freelancers in database
export const debugFreelancers = async (req, res) => {
  try {
    const allUsers = await User.find({}).select('name email role totalOrders isVerified');
    const freelancers = await User.find({ role: 'freelancer' }).select('name email role totalOrders isVerified profile');
    
    res.status(200).json({
      success: true,
      totalUsers: allUsers.length,
      allUsers: allUsers,
      totalFreelancers: freelancers.length,
      freelancers: freelancers
    });
  } catch (error) {
    console.error('Error in debug:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while debugging' 
    });
  }
}; 