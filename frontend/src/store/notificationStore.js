import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URLS } from "../config/api.js";

const API_URL = API_URLS.notifications;

axios.defaults.withCredentials = true;

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    error: null,
    isLoading: false,
    pagination: {
        page: 1,
        pages: 1,
        total: 0,
        hasMore: false
    },

    // Fetch notifications
    fetchNotifications: async (page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}?page=${page}`);
            if (response.data.success) {
                set(state => ({
                    notifications: page === 1 
                        ? response.data.notifications 
                        : [...state.notifications, ...response.data.notifications],
                    unreadCount: response.data.unreadCount,
                    pagination: response.data.pagination,
                    isLoading: false
                }));
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({
                error: error.response?.data?.message || 'Failed to fetch notifications',
                isLoading: false
            });
        }
    },

    // Load more notifications
    loadMoreNotifications: async () => {
        const state = get();
        if (state.isLoading || !state.pagination.hasMore) return;
        
        const nextPage = state.pagination.page + 1;
        await get().fetchNotifications(nextPage);
    },

    // Mark notifications as read
    markAsRead: async (notificationIds) => {
        try {
            const response = await axios.patch(`${API_URL}/mark-read`, { notificationIds });
            
            // Update local state
            set(state => ({
                notifications: state.notifications.map(notification =>
                    notificationIds.includes(notification._id)
                        ? { ...notification, read: true }
                        : notification
                ),
                unreadCount: response.data.unreadCount
            }));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
        try {
            const state = get();
            const unreadNotificationIds = state.notifications
                .filter(notification => !notification.read)
                .map(notification => notification._id);
            
            if (unreadNotificationIds.length > 0) {
                const response = await axios.patch(`${API_URL}/mark-read`, { notificationIds: unreadNotificationIds });
                
                // Update local state
                set(state => ({
                    notifications: state.notifications.map(notification => ({ ...notification, read: true })),
                    unreadCount: response.data.unreadCount
                }));
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    }
})); 