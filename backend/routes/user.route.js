import express from 'express';
import { createUserProfile, getUserProfile, updateFreelancerStats, getTopFreelancers, createTestFreelancers, debugFreelancers } from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Route to create a new user profile - requires authentication
router.post('/profile', protectRoute, createUserProfile);

// Route to get user profile - requires authentication
router.get('/profile', protectRoute, getUserProfile);

// Route to update freelancer stats - requires authentication
router.patch('/stats', protectRoute, updateFreelancerStats);

// Route to get top freelancers by total orders (public)
router.get('/top-freelancers', getTopFreelancers);

// Route to create test freelancers (development only)
router.post('/create-test-freelancers', createTestFreelancers);

// Debug route to check freelancers in database
router.get('/debug-freelancers', debugFreelancers);

export default router; 