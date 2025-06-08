import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import Notification from '../models/notification.model.js';

const router = express.Router();

// Get user's notifications
router.get('/', protectRoute, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find({ recipient: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'sender',
                    select: 'name email profile.pictureUrl'
                })
                .populate('job', 'title')
                .populate('proposal', 'coverLetter bidAmount')
                .populate('message', 'content'),
            
            Notification.countDocuments({ recipient: req.user._id }),
            
            Notification.countDocuments({
                recipient: req.user._id,
                read: false
            })
        ]);

        res.json({
            success: true,
            notifications,
            unreadCount,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: total > skip + notifications.length
            }
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

        // Get updated unread count
        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });

        res.json({
            success: true,
            message: 'Notifications marked as read',
            unreadCount
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