import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, jobId, proposalId } = req.body;

        // Validate required fields
        if (!receiverId || !content) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        // Create message
        const message = new Message({
            sender: req.user._id,
            receiver: receiverId,
            content,
            job: jobId,
            proposal: proposalId
        });

        await message.save();

        // Populate sender and receiver info
        await message.populate([
            { path: 'sender', select: 'name email profile.pictureUrl' },
            { path: 'receiver', select: 'name email profile.pictureUrl' }
        ]);

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get conversation with a specific user
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Convert userId to ObjectId using new keyword
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const currentUserObjectId = new mongoose.Types.ObjectId(req.user._id);

        // Get messages between current user and specified user
        const messages = await Message.find({
            $or: [
                { sender: currentUserObjectId, receiver: userObjectId },
                { sender: userObjectId, receiver: currentUserObjectId }
            ]
        })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate([
            { path: 'sender', select: 'name email profile.pictureUrl' },
            { path: 'receiver', select: 'name email profile.pictureUrl' },
            { path: 'job', select: 'title' },
            { path: 'proposal', select: 'coverLetter bidAmount' }
        ]);

        // Mark unread messages as read
        await Message.updateMany(
            {
                sender: userObjectId,
                receiver: currentUserObjectId,
                isRead: false
            },
            { isRead: true }
        );

        // Get total count for pagination
        const total = await Message.countDocuments({
            $or: [
                { sender: currentUserObjectId, receiver: userObjectId },
                { sender: userObjectId, receiver: currentUserObjectId }
            ]
        });

        res.status(200).json({
            success: true,
            data: messages,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({
            success: false,
            message: error.name === 'CastError' ? "Invalid user ID format" : "Internal server error"
        });
    }
};

// Get all conversations (chat list)
export const getConversations = async (req, res) => {
    try {
        const currentUserObjectId = new mongoose.Types.ObjectId(req.user._id);

        // Get the latest message from each conversation
        const conversations = await Message.aggregate([
            // Match messages involving the current user
            {
                $match: {
                    $or: [
                        { sender: currentUserObjectId },
                        { receiver: currentUserObjectId }
                    ]
                }
            },
            // Sort by creation date
            { $sort: { createdAt: -1 } },
            // Group by conversation (combination of sender and receiver)
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", currentUserObjectId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiver", currentUserObjectId] },
                                        { $eq: ["$isRead", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Populate user information
        const populatedConversations = await User.populate(conversations, {
            path: "_id",
            select: "name email profile"
        });

        res.status(200).json({
            success: true,
            data: populatedConversations
        });

    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({
            success: false,
            message: error.name === 'CastError' ? "Invalid user ID format" : "Internal server error"
        });
    }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            data: { count }
        });

    } catch (error) {
        console.error("Error getting unread count:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}; 