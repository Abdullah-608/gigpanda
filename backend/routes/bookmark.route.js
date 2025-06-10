import express from 'express';
import {verifyToken} from '../middleware/verifyToken.js';
import { addBookmark, removeBookmark, getBookmarks, checkBookmark } from '../controllers/bookmark.controller.js';
const router = express.Router();

// Add a bookmark
router.post('/', verifyToken, addBookmark);

// Remove a bookmark
router.delete('/:job_id', verifyToken, removeBookmark);  // Changed from post_id to job_id

// Get all bookmarks for current user
router.get('/', verifyToken, getBookmarks);

// Check if a job is bookmarked
router.get('/check/:job_id', verifyToken, checkBookmark);  // Changed from post_id to job_id

export default router;