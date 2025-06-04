import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";

import LandingPage from "./pages/LandingPage"; // Import the new landing page
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import FreelancerDashboardPage from "./pages/FreelancerDashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfileSetupPage from "./pages/ProfileSetupPage"; // Import the new ProfileSetupPage

import LoadingSpinner from "./components/LoadingSpinner";

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

// redirect authenticated users to the dashboard
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to='/dashboard' replace />;
	}

	return children;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	// Check if current route is a dashboard route
	const isDashboardRoute = ['/dashboard', '/client-dashboard', '/freelancer-dashboard', '/profile-setup'].includes(location.pathname);

	// For dashboard routes, render without background
	if (isDashboardRoute) {
		return (
			<div className="min-h-screen">
				<Routes>
					<Route
						path='/dashboard'
						element={
							<ProtectedRoute>
								<DashboardPage />
							</ProtectedRoute>
						}
					/>

					{/* Client Dashboard */}
					<Route
						path='/client-dashboard'
						element={
							<ProtectedRoute>
								<ClientDashboardPage />
							</ProtectedRoute>
						}
					/>

					{/* Freelancer Dashboard */}
					<Route
						path='/freelancer-dashboard'
						element={
							<ProtectedRoute>
								<FreelancerDashboardPage />
							</ProtectedRoute>
						}
					/>
					
					{/* Profile Setup Page - accessible only for authenticated users */}
					<Route
						path='/profile-setup'
						element={
							<ProtectedRoute>
								<ProfileSetupPage />
							</ProtectedRoute>
						}
					/>
				</Routes>
				<Toaster />
			</div>
		);
	}

	// For auth pages, render with green background and floating shapes
	return (
		<div
			className='min-h-screen bg-gradient-to-br
    from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center relative overflow-hidden'
		>
			<FloatingShape color='bg-green-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />

			<Routes>
				{/* Landing page as the default route */}
				<Route path='/' element={<LandingPage />} />
                
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