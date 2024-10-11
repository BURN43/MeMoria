import { create } from 'zustand';
import axios from 'axios';

const API_URL =
	import.meta.env.MODE === 'development'
		? 'https://e7ea99a1-f3aa-439b-97db-82d9e87187ed-00-1etsckkyhp4f3.spock.replit.dev:5000/api/auth'
		: '/api/auth';

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
				`${API_URL}/signup`,
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
				`${API_URL}/login`,
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
			await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
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
			const response = await axios.get(`${API_URL}/check-auth`, {
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
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
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
				`${API_URL}/reset-password/${token}`,
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
