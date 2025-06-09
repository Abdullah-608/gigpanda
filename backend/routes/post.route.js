import express from 'express';
import { createPost, getPosts, getPostById, toggleLikePost, addComment, addReaction } from '../controllers/post.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Create a new post (requires authentication)
router.post('/', protectRoute, createPost);

// Get all posts (paginated, with optional filtering)
router.get('/', getPosts);

// Get a single post by ID
router.get('/:postId', getPostById);

// Like/Unlike a post (requires authentication)
router.post('/:postId/like', protectRoute, toggleLikePost);

// Add a comment to a post (requires authentication)
router.post('/:postId/comment', protectRoute, addComment);

// Add a reaction to a post (requires authentication)
router.post('/:postId/reaction', protectRoute, addReaction);

export default router; 