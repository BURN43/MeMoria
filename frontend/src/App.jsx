import React, { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Toaster } from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from './Stripe/Stripe';
import { Analytics } from '@vercel/analytics/react';

import './styles/global.css';

// Lazy load components
const NavBar = lazy(() => import('./components/NavBar'));
const GuestNavBar = lazy(() => import('./components/GuestNavBar'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const EmailVerificationPage = lazy(() => import('./pages/EmailVerificationPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DesignTableStandPage = lazy(() => import('./pages/DesignTableStandPage'));
const PhotoChallengePage = lazy(() => import('./pages/PhotoChallengePage'));
const GuestChallengeView = lazy(() => import('./pages/GuestChallengeView'));
const AlbumWithToken = lazy(() => import('./pages/AlbumWithToken'));
const PaketErweitern = lazy(() => import('./pages/PaketErweitern'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('./pages/PaymentCancelPage'));

// Loading component
const Loading = React.memo(() => <div>Loading...</div>);

// Admin Protected Route
const AdminProtectedRoute = React.memo(({ children }) => {
	const { isAuthenticated, user, isLoading } = useAuthStore();
	const location = useLocation();

	if (isLoading) return <Loading />;
	if (!isAuthenticated) return <Navigate to='/login' state={{ from: location }} replace />;
	if (!user.isVerified) return <Navigate to='/verify-email' state={{ from: location }} replace />;
	if (user.role !== 'admin') return <div>Access Denied: Admins only</div>;

	return children;
});

// Redirect Authenticated User
const RedirectAuthenticatedUser = React.memo(({ children }) => {
	const { isAuthenticated, user, isLoading } = useAuthStore();
	const location = useLocation();

	if (isLoading) return <Loading />;
	if (isAuthenticated && user.isVerified) {
		const from = location.state?.from?.pathname || '/';
		return <Navigate to={from} replace />;
	}

	return children;
});

function App() {
	const { checkAuth, user, isAuthenticated, isLoading } = useAuthStore();
	const location = useLocation();
	const [isInitialized, setIsInitialized] = useState(false);

	const query = new URLSearchParams(location.search);
	const albumToken = query.get('token');

	const initializeAuth = useCallback(async () => {
		if (!albumToken && !isAuthenticated) {
			await checkAuth();
		}
		setIsInitialized(true);
	}, [checkAuth, albumToken, isAuthenticated]);

	useEffect(() => {
		initializeAuth();
	}, [initializeAuth]);

	if (!isInitialized || isLoading) {
		return <Loading />;
	}

	return (
		<Elements stripe={stripePromise}>
			<div className='min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden'>
				<Suspense fallback={<Loading />}>
					{albumToken ? <GuestNavBar /> : isAuthenticated && <NavBar />}

					<Routes>
						<Route path='/' element={<AdminProtectedRoute><DashboardPage /></AdminProtectedRoute>} />
						<Route path='/settings' element={<AdminProtectedRoute><SettingsPage /></AdminProtectedRoute>} />
						<Route path='/album' element={<AlbumWithToken />} />
						<Route path='/photo-challenge' element={<AdminProtectedRoute><PhotoChallengePage /></AdminProtectedRoute>} />
						<Route path='/guest-challenge' element={<GuestChallengeView />} />
						<Route path='/design-table-stand' element={<AdminProtectedRoute><DesignTableStandPage /></AdminProtectedRoute>} />
						<Route path='/paket-erweitern' element={<AdminProtectedRoute><PaketErweitern /></AdminProtectedRoute>} />
						<Route path='/signup' element={<RedirectAuthenticatedUser><SignUpPage /></RedirectAuthenticatedUser>} />
						<Route path='/login' element={<RedirectAuthenticatedUser><LoginPage /></RedirectAuthenticatedUser>} />
						<Route path='/verify-email' element={<EmailVerificationPage />} />
						<Route path='/forgot-password' element={<RedirectAuthenticatedUser><ForgotPasswordPage /></RedirectAuthenticatedUser>} />
						<Route path='/reset-password/:token' element={<RedirectAuthenticatedUser><ResetPasswordPage /></RedirectAuthenticatedUser>} />
						<Route path='/payment-success' element={<AdminProtectedRoute><PaymentSuccessPage /></AdminProtectedRoute>} />
						<Route path='/payment-cancel' element={<AdminProtectedRoute><PaymentCancelPage /></AdminProtectedRoute>} />
						<Route path='*' element={<Navigate to='/' replace />} />
					</Routes>
				</Suspense>
				<Toaster />
				<Analytics /> {/* Added Analytics component for Vercel */}
			</div>
		</Elements>
	);
}

export default React.memo(App);
