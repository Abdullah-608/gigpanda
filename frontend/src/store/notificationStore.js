import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/notifications" : "/api/notifications";

axios.defaults.withCredentials = true;

export const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,
    error: null,
    isLoading: false,

    // Fetch notifications
    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(API_URL);
            if (response.data.success) {
                set({
                    notifications: response.data.notifications,
                    unreadCount: response.data.unreadCount,
                    isLoading: false
                });
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({
                error: error.response?.data?.message || 'Failed to fetch notifications',
                isLoading: false
            });
        }
    },

    // Mark notifications as read
    markAsRead: async (notificationIds) => {
        try {
            await axios.patch(`${API_URL}/mark-read`, { notificationIds });
            
            // Update local state
            set(state => ({
                notifications: state.notifications.map(notification =>
                    notificationIds.includes(notification._id)
                        ? { ...notification, read: true }
                        : notification
                ),
                unreadCount: Math.max(0, state.unreadCount - notificationIds.length)
            }));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    }
})); 