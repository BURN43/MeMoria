import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar'; // Existing NavBar for authenticated users
import GuestNavBar from './components/GuestNavBar'; // New NavBar for token-based access
import { useAuthStore } from './store/authStore';

import SignUpPage from './pages/SignUpPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DesignTableStandPage from './pages/DesignTableStandPage';
import PhotoChallengePage from './pages/PhotoChallengePage';
import GuestChallengeView from './pages/GuestChallengeView';
import AlbumWithToken from './pages/AlbumWithToken'; // Import custom component
import './styles/global.css';
import { Toaster } from 'react-hot-toast';


// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	if (user.role !== 'admin') {
		return <div>Access Denied: Admins only</div>;
	}

	return children;
};

// Redirect Authenticated User
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to='/' replace />;
	}

	return children;
};

function App() {
	const { checkAuth, user, isAuthenticated } = useAuthStore();
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const albumToken = query.get('token');

	useEffect(() => {
		if (!albumToken) {
			// Only check authentication if there is no album token
			checkAuth();
		}
	}, [checkAuth, albumToken]);

	return (
		<div
			className='min-h-screen bg-gradient-to-br
				from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden'
		>
			{albumToken ? <GuestNavBar /> : isAuthenticated && <NavBar />}

			<Routes>
				<Route
					path='/'
					element={
						<AdminProtectedRoute>
							<DashboardPage />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path='/settings'
					element={
						<AdminProtectedRoute>
							<SettingsPage />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path='/album'
					element={<AlbumWithToken />} // Accessible without admin privileges
				/>
				<Route
					path='/photo-challenge'
					element={
						<AdminProtectedRoute>
							<PhotoChallengePage />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path='/guest-challenge'
					element={<GuestChallengeView />} // Accessible without admin privileges
				/>
				<Route
					path='/design-table-stand'
					element={
						<AdminProtectedRoute>
							<DesignTableStandPage />
						</AdminProtectedRoute>
					}
				/>
				<Route
					path='/signup'
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path='/verify-email' element={<EmailVerificationPage />} />
				<Route
					path='/forgot-password'
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				{/* Catch-all route */}
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
