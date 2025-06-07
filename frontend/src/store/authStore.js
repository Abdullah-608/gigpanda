import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

// Add axios interceptors for better error handling
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Clear auth state on 401 errors
			useAuthStore.getState().clearAuthState();
		}
		return Promise.reject(error);
	}
);

export const useAuthStore = create((set, get) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,
	topFreelancers: [],
	isLoadingFreelancers: false,
	activeTab: "dashboard",

	clearAuthState: () => {
		set({
			user: null,
			isAuthenticated: false,
			error: null,
			isCheckingAuth: false
		});
	},

	checkAuth: async () => {
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			if (response.data.success && response.data.user) {
				const user = response.data.user;
				set({ user, isAuthenticated: true, isCheckingAuth: false, error: null });
			} else {
				set({ user: null, isAuthenticated: false, isCheckingAuth: false, error: null });
			}
		} catch (error) {
			console.error('Error checking auth:', error.response?.data || error.message);
			// Only reset auth state if it's an authentication error
			if (error.response?.status === 401) {
				set({ user: null, isAuthenticated: false, isCheckingAuth: false, error: null });
				toast.error("Session expired. Please login again.");
			} else {
				// For other errors, maintain the current auth state but update the checking status
				set(state => ({ ...state, isCheckingAuth: false, error: error.response?.data?.message || 'Error checking authentication' }));
			}
		}
	},

	signup: async (email, password, name, role) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/signup`, { email, password, name, role });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			toast.success("Signup successful!");
			return response.data;
		} catch (error) {
			const errorMsg = error.response?.data?.message || "Error signing up";
			set({ error: errorMsg, isLoading: false });
			toast.error(errorMsg);
			throw error;
		}
	},

	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password });
			const user = response.data.user;
			set({ user, isAuthenticated: true, isLoading: false });
			toast.success("Login successful!");
			return user;
		} catch (error) {
			const errorMsg = error.response?.data?.message || "Login failed";
			set({ 
				error: errorMsg,
				isLoading: false 
			});
			toast.error(errorMsg);
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/logout`);
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
			
			// Also clear profile data from user store
			// We do this by importing the store dynamically to avoid circular dependencies
			const { useUserStore } = await import('./userStore');
			useUserStore.getState().clearProfile();
			
			toast.success("Logged out successfully");
		} catch (error) {
			console.error("Logout error:", error);
			set({ error: "Error logging out", isLoading: false });
			toast.error("Error logging out");
		}
	},

	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			set({ 
				user: response.data.user, 
				isAuthenticated: true, 
				isLoading: false,
				error: null,
				message: response.data.message 
			});
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Error verifying email";
			set({ 
				error: errorMessage, 
				isLoading: false,
				isAuthenticated: false 
			});
			throw new Error(errorMessage);
		}
	},

	resendVerificationCode: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/resend-verification`);
			set({ message: response.data.message, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error resending verification code", isLoading: false });
			throw error;
		}
	},

	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},

	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error resetting password",
			});
			throw error;
		}
	},

	// Fetch top freelancers
	fetchTopFreelancers: async (limit = 2) => {
		set({ isLoadingFreelancers: true, error: null });
		try {
			const USER_API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/users" : "/api/users";
			const response = await axios.get(`${USER_API_URL}/top-freelancers?limit=${limit}`);
			set({ 
				topFreelancers: response.data.freelancers, 
				isLoadingFreelancers: false 
			});
		} catch (error) {
			console.error("Error fetching top freelancers:", error);
			set({ 
				error: error.response?.data?.message || "Failed to fetch top freelancers",
				isLoadingFreelancers: false 
			});
		}
	},

	// Helper method to get current user
	getCurrentUser: () => get().user,

	setActiveTab: (tab) => set({ activeTab: tab })
}));
