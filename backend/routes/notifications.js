import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import Notification from '../models/notification.model.js';

const router = express.Router();

// Get user's notifications
router.get('/', protectRoute, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate({
                path: 'sender',
                select: 'name email profile.pictureUrl'
            })
            .populate('job', 'title')
            .populate('proposal', 'coverLetter bidAmount')
            .populate('message', 'content');

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });

        res.json({
            success: true,
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
});

// Mark notifications as read
router.patch('/mark-read', protectRoute, async (req, res) => {
    try {
        const { notificationIds } = req.body;

        await Notification.updateMany(
            {
                _id: { $in: notificationIds },
                recipient: req.user._id
            },
            { read: true }
        );

        res.json({
            success: true,
            message: 'Notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notifications as read'
        });
    }
});

export { router }; 