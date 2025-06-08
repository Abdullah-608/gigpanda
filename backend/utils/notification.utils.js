import Notification from '../models/notification.model.js';

export const createNotification = async ({ recipient, sender, type, job = null, proposal = null, post = null, message = null }) => {
    try {
        const notification = new Notification({
            recipient,
            sender,
            type,
            job,
            proposal,
            post,
            message
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}; 