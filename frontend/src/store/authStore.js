import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set, get) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,
	topFreelancers: [],
	isLoadingFreelancers: false,

	signup: async (email, password, name,role) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/signup`, { email, password, name ,role});
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			set({ error: error.response.data.message || "Error signing up", isLoading: false });
			throw error;
		}
	},
	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password });
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
			console.log(error)
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
		} catch (error) {
			set({ error: "Error logging out", isLoading: false });
			throw error;
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
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/auth/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
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
}));
