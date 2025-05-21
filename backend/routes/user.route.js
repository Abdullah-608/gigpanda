import express from 'express';
import { createUserProfile, getUserProfile } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Route to create a new user profile - requires authentication
router.post('/profile', protectRoute, createUserProfile);

// Route to get user profile - requires authentication
router.get('/profile', protectRoute, getUserProfile);

export default router; 