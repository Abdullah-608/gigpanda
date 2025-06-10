import Bookmark from '../models/bookmark.model.js';

// Add a bookmark
export const addBookmark = async (req, res) => {
  try {
    const { job_id } = req.body;  // Changed from post_id to job_id
    const user_id = req.userId;  // Based on your verifyToken middleware

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({ user: user_id, job: job_id });

    if (existingBookmark) {
      return res.status(400).json({ success: false, message: 'Job already bookmarked' });
    }

    // Create new bookmark
    const newBookmark = new Bookmark({
      user: user_id,
      job: job_id  // Changed from post to job
    });

    await newBookmark.save();
    res.json({ success: true, message: 'Job bookmarked successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Remove a bookmark
export const removeBookmark = async (req, res) => {
  try {
    const job_id = req.params.job_id;  // Changed from post_id to job_id
    const user_id = req.userId;

    // Delete bookmark
    const result = await Bookmark.findOneAndDelete({ user: user_id, job: job_id });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Bookmark not found' });
    }

    res.json({ success: true, message: 'Bookmark removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get all bookmarks for current user
export const getBookmarks = async (req, res) => {
  try {
    const user_id = req.userId;

    // Get bookmarked jobs with full job data and client data
    const bookmarks = await Bookmark.find({ user: user_id })
      .populate({
        path: 'job',
        populate: {
          path: 'client',
          select: 'name email' // Only select necessary client fields
        }
      })
      .sort({ createdAt: -1 });

    // Transform the data to match the expected format
    const bookmarkedJobs = bookmarks.map(bookmark => {
      const job = bookmark.job.toObject();
      return {
        ...job,
        bookmarked_at: bookmark.createdAt
      };
    });

    res.json({ success: true, data: bookmarkedJobs });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Check if a job is bookmarked
export const checkBookmark = async (req, res) => {
  try {
    const job_id = req.params.job_id;  // Changed from post_id to job_id
    const user_id = req.userId;

    const bookmark = await Bookmark.findOne({ user: user_id, job: job_id });

    res.json({ success: true, isBookmarked: !!bookmark });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};