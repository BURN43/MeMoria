import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";

import SignUpPage from "./pages/SignUpPage";
import SettingsPage from './pages/SettingsPage';  
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import DesignTableStandPage from './pages/DesignTableStandPage';
import PhotoChallengePage from './pages/PhotoChallengePage';
import GuestChallengeView from './pages/GuestChallengeView';
import AlbumPage from './pages/AlbumPage';
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";


// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to='/' replace />;
	}

	return children;
};



function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	return (
		<div
			className='min-h-screen bg-gradient-to-br
		from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden'
		>
			<FloatingShape color='bg-purple-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-blue-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-purple-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />

			<Routes>
				<Route
					path='/'
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>			
				<Route
					path='/settings'
					element={
					<ProtectedRoute>
						<SettingsPage />  
					</ProtectedRoute>
					}
				/>
				<Route
					path='/album'
					element={
						<ProtectedRoute>
							<AlbumPage/>
						</ProtectedRoute>
					}
				/>	
				<Route
					path='/photo-challenge'
					element={
						<ProtectedRoute>
							<PhotoChallengePage />
						</ProtectedRoute>
					}
				/>		
				<Route
					path='/guest-challange'
					element={
						<ProtectedRoute>
							<GuestChallengeView />
						</ProtectedRoute>
					}
				/>	
				<Route
					path='/design-table-stand'
					element={
						<ProtectedRoute>
							<DesignTableStandPage />
						</ProtectedRoute>
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
				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
