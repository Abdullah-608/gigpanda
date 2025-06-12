import Bookmark from '../models/bookmark.model.js';
import mongoose from 'mongoose';

// Add a bookmark
export const addBookmark = async (req, res) => {
  try {
    const { job_id } = req.body;
    const user_id = req.userId;

    // Validate job_id
    if (!job_id) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    // Convert to ObjectId if string
    const jobObjectId = mongoose.Types.ObjectId.isValid(job_id) 
      ? new mongoose.Types.ObjectId(job_id) 
      : job_id;
      
    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ 
      user: user_id, 
      job: jobObjectId 
    });

    if (existingBookmark) {
      return res.status(400).json({ success: false, message: 'Job already bookmarked' });
    }

    // Create new bookmark
    const newBookmark = new Bookmark({
      user: user_id,
      job: jobObjectId
    });

    await newBookmark.save();
    res.json({ success: true, message: 'Job bookmarked successfully', bookmark: newBookmark });
  } catch (err) {
    console.error('Error saving bookmark:', err);
    
    // Check if it's a duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Job already bookmarked (duplicate key error)'
      });
    }
    
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all bookmarks for current user
export const getBookmarks = async (req, res) => {
  try {
    const user_id = req.userId;

    const bookmarks = await Bookmark.find({ user: user_id })
      .populate({
        path: 'job',
        populate: {
          path: 'client',
          select: 'name email' 
        }
      })
      .sort({ createdAt: -1 });

    const bookmarkedJobs = bookmarks.map(bookmark => {
      if (!bookmark.job) {
        return null; // Handle any potential null job references
      }
      const job = bookmark.job.toObject();
      return {
        ...job,
        bookmarked_at: bookmark.createdAt,
        bookmark_id: bookmark._id // Include bookmark ID for easier removal
      };
    }).filter(Boolean); // Remove any null entries

    res.json({ success: true, data: bookmarkedJobs });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Remove a bookmark
export const removeBookmark = async (req, res) => {
  try {
    const job_id = req.params.job_id;
    const user_id = req.userId;

    // Convert to ObjectId if string
    const jobObjectId = mongoose.Types.ObjectId.isValid(job_id) 
      ? new mongoose.Types.ObjectId(job_id) 
      : job_id;

    const result = await Bookmark.findOneAndDelete({ 
      user: user_id, 
      job: jobObjectId 
    });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    res.json({ success: true, message: 'Bookmark removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Check if a job is bookmarked
export const checkBookmark = async (req, res) => {
  try {
    const job_id = req.params.job_id;
    const user_id = req.userId;

    // Convert to ObjectId if string
    const jobObjectId = mongoose.Types.ObjectId.isValid(job_id) 
      ? new mongoose.Types.ObjectId(job_id) 
      : job_id;

    const bookmark = await Bookmark.findOne({ 
      user: user_id, 
      job: jobObjectId 
    });

    res.json({ success: true, isBookmarked: !!bookmark });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};