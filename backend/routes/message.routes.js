import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    sendMessage,
    getConversation,
    getConversations,
    getUnreadCount
} from "../controllers/message.controller.js";

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Send a message
router.post("/", sendMessage);

// Get conversation with a specific user
router.get("/conversation/:userId", getConversation);

// Get all conversations (chat list)
router.get("/conversations", getConversations);

// Get unread message count
router.get("/unread", getUnreadCount);

export default router; 