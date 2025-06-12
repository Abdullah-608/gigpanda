import express from 'express';
import { sendChatMessage, clearChatHistory } from '../controllers/gemini.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Protected routes requiring authentication
router.post('/chat', protectRoute, sendChatMessage);
router.post('/clear-chat', protectRoute, clearChatHistory);

// Public health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Gemini API service is running' 
  });
});

export default router;