import { create } from 'zustand';
import axios from 'axios';

// Option 1: Direct backend URL in development
const API_URL = import.meta.env.MODE === 'development'
? import.meta.env.VITE_API_URL_BASE_WITH_API_DEV // Development URL
: import.meta.env.VITE_API_URL_BASE_WITH_API_PROD; // Production URL

// Remove global axios defaults to prevent sending cookies with every request
// axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,

	signup: async (email, password, name) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(
				`${API_URL}/auth/signup`,
				{ email, password, name },
				{ withCredentials: true }
			);
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			set({
				error: error.response?.data?.message || 'Error signing up',
				isLoading: false,
			});
			throw error;
		}
	},

	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(
				`${API_URL}/auth/login`,
				{ email, password },
				{ withCredentials: true }
			);
			set({
				isAuthenticated: true,
				user: response.data.user,
				error: null,
				isLoading: false,
			});
		} catch (error) {
			set({
				error: error.response?.data?.message || 'Error logging in',
				isLoading: false,
			});
			throw error;
		}
	},

	logout: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
			set({ user: null, isAuthenticated: false, error: null, isLoading: false });
		} catch (error) {
			set({ error: 'Error logging out', isLoading: false });
			throw error;
		}
	},

	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(
				`${API_URL}/verify-email`,
				{ code },
				{ withCredentials: true }
			);
			set({
				user: response.data.user,
				isAuthenticated: true,
				isLoading: false,
			});
			return response.data;
		} catch (error) {
			set({
				error: error.response?.data?.message || 'Error verifying email',
				isLoading: false,
			});
			throw error;
		}
	},

	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/auth/check-auth`, {
				withCredentials: true,
			});
			set({
				user: response.data.user,
				isAuthenticated: true,
				isCheckingAuth: false,
			});
		} catch (error) {
			if (error.response && error.response.status === 401) {
				// User is not authenticated; set user to null without logging an error
				set({
					user: null,
					isAuthenticated: false,
					isCheckingAuth: false,
					error: null,
				});
			} else {
				console.error('Error checking authentication:', error);
				set({
					error: 'Error checking authentication',
					isCheckingAuth: false,
					isAuthenticated: false,
				});
			}
		}
	},

	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error:
					error.response?.data?.message || 'Error sending reset password email',
			});
			throw error;
		}
	},

	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(
				`${API_URL}/auth/reset-password/${token}`,
				{ password }
			);
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || 'Error resetting password',
			});
			throw error;
		}
	},
}));
