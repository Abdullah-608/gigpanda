const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Store SSE clients
const clients = new Map();

// Helper function to send SSE message
const sendSSEMessage = (res, data) => {
    try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
        console.error('Error sending SSE message:', error);
        // Remove failed connection
        for (const [convId, userMap] of clients.entries()) {
            for (const [userId, userRes] of userMap.entries()) {
                if (userRes === res) {
                    userMap.delete(userId);
                    if (userMap.size === 0) {
                        clients.delete(convId);
                    }
                    break;
                }
            }
        }
    }
};

// Keep connection alive
const keepAlive = (res) => {
    const interval = setInterval(() => {
        try {
            res.write(': ping\n\n');
        } catch (error) {
            clearInterval(interval);
        }
    }, 30000); // Send ping every 30 seconds

    return interval;
};

// SSE endpoint
router.get('/stream/:userId', auth, (req, res) => {
    const userId = req.user._id.toString();

    // Set headers for SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send initial heartbeat
    sendSSEMessage(res, { type: 'connected' });

    // Store this client's response object
    if (!clients.has(userId)) {
        clients.set(userId, new Map());
    }
    clients.get(userId).set(userId, res);

    // Set up keep-alive
    const keepAliveInterval = keepAlive(res);

    // Handle client disconnect
    req.on('close', () => {
        clearInterval(keepAliveInterval);
        if (clients.has(userId)) {
            clients.get(userId).delete(userId);
            if (clients.get(userId).size === 0) {
                clients.delete(userId);
            }
        }
    });

    // Handle connection errors
    res.on('error', (error) => {
        console.error('SSE connection error:', error);
        clearInterval(keepAliveInterval);
        if (clients.has(userId)) {
            clients.get(userId).delete(userId);
            if (clients.get(userId).size === 0) {
                clients.delete(userId);
            }
        }
    });
});

// Send message
router.post('/', auth, async (req, res) => {
    try {
        const { receiverId, content, jobId, proposalId } = req.body;
        const senderId = req.user._id;

        // Check if this is the first message between these users
        const existingMessage = await Message.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            job: jobId,
            proposal: proposalId
        });

        const savedMessage = await message.save();
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('sender', 'name profile')
            .populate('receiver', 'name profile');

        // Create the event object
        const event = {
            type: 'message',
            message: populatedMessage
        };

        // Send SSE event to both participants
        // Check receiver's stream
        if (clients.has(receiverId.toString())) {
            for (const [, clientRes] of clients.get(receiverId.toString())) {
                sendSSEMessage(clientRes, event);
            }
        }

        // Check sender's stream
        if (clients.has(senderId.toString())) {
            for (const [, clientRes] of clients.get(senderId.toString())) {
                sendSSEMessage(clientRes, event);
            }
        }

        // If this is the first message, create a notification
        if (!existingMessage) {
            await createNotification({
                recipient: receiverId,
                sender: senderId,
                type: 'NEW_MESSAGE',
                message: savedMessage._id
            });
        }

        res.status(201).json({ data: populatedMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Mark messages as read
router.post('/read', auth, async (req, res) => {
    try {
        const { messageIds } = req.body;
        const userId = req.user._id;

        await Message.updateMany(
            { _id: { $in: messageIds }, receiver: userId },
            { $set: { isRead: true } }
        );

        // Send read receipt event to sender
        const messages = await Message.find({ _id: { $in: messageIds } });
        const senderIds = [...new Set(messages.map(m => m.sender.toString()))];

        senderIds.forEach(senderId => {
            if (clients.has(senderId)) {
                const event = {
                    type: 'read_receipt',
                    messageIds
                };
                clients.get(senderId).forEach(res => {
                    res.write(`data: ${JSON.stringify(event)}\n\n`);
                });
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Error marking messages as read' });
    }
});

// Get conversation messages
router.get('/conversation/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'name profile')
        .populate('receiver', 'name profile');

        res.json({ data: messages });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ message: 'Error fetching conversation' });
    }
});

module.exports = router; 