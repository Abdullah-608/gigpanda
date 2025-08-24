import { create } from "zustand";
import axios from "axios";
import { API_URLS } from "../config/api.js";

const API_URL = API_URLS.users;

axios.defaults.withCredentials = true;

export const useUserStore = create((set) => ({
    isLoading: false,
    error: null,
    profile: null,

    // Create or update user profile
    updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
            // Clone the data to prevent any unintended modifications
            const dataToSend = JSON.parse(JSON.stringify(profileData));
            console.log('Sending profile update request with data:', JSON.stringify(dataToSend, null, 2));
            const response = await axios.post(`${API_URL}/profile`, dataToSend);
            console.log('Profile update response:', response.data);
            set({
                profile: response.data.user.profile,
                isLoading: false,
                error: null
            });
            return response.data;
        } catch (error) {
            console.error('Profile update error:', error.response?.data || error);
            const errorMessage = error.response?.data?.error || "Failed to update profile";
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    // Get user profile
    getProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/profile`);
            set({
                profile: response.data.user.profile,
                isLoading: false,
                error: null
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to fetch profile";
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },
    
    // Clear profile data (useful for logout)
    clearProfile: () => {
        set({ profile: null });
    }
})); 