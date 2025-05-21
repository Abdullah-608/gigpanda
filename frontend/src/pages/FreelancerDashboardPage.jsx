import { useAuthStore } from "../store/authStore";
import { BookmarkIcon, BellIcon, User, Menu } from "lucide-react";
import SearchBar from "../components/SearchBar";
import { Navigate, useNavigate } from "react-router-dom";

const FreelancerDashboardPage = () => {
	const { user, logout } = useAuthStore();
	const navigate = useNavigate();
	
	// Check if user has the correct role
	if (user?.role !== "freelancer") {
		return <Navigate to="/client-dashboard" replace />;
	}
	
	const handleLogout = () => {
		logout();
	};
	
	// This is a placeholder for the freelancer dashboard
	return (
		<div className="min-h-screen bg-white">
			{/* Top navigation bar */}
			<header className="bg-white border-b border-gray-200 sticky top-0 z-10">
				<div className="w-full px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<div className="flex-shrink-0 flex items-center">
								<span className="text-2xl font-bold text-gray-800">GigPanda</span>
								<span className="ml-2 text-2xl">🐼</span>
							</div>
							<div className="hidden md:ml-6 md:flex md:space-x-8">
								<a href="#" className="border-b-2 border-gray-800 text-gray-900 px-1 pt-5 pb-4 text-sm font-medium">
									Dashboard
								</a>
								<a href="#" className="border-b-2 border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700 px-1 pt-5 pb-4 text-sm font-medium">
									Messages
								</a>
							</div>
						</div>
						<div className="flex items-center">
							<div className="flex-shrink-0 flex items-center space-x-4">
								{/* Search component */}
								<SearchBar />
								<button type="button" className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
									<BookmarkIcon className="h-5 w-5" />
								</button>
								<button type="button" className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none relative">
									<BellIcon className="h-5 w-5" />
									<span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-gray-500 ring-2 ring-white"></span>
								</button>
								<div className="ml-3 relative">
									<div className="flex items-center">
										<button className="bg-gray-100 flex text-sm rounded-full focus:outline-none">
											<span className="sr-only">Open user menu</span>
											<div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white">
												{user?.name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
											</div>
										</button>
										<span className="ml-2 text-sm text-gray-700 hidden md:block">
											{user?.name || "User"}
										</span>
									</div>
								</div>
							</div>
							<div className="flex md:hidden ml-3">
								<button type="button" className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
									<Menu className="h-6 w-6" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</header>
			
			<main className="w-full px-4 sm:px-6 lg:px-8 py-6">
				<div className="w-full bg-white rounded-xl shadow-sm p-6 border border-gray-100">
					<h2 className="text-xl font-bold text-gray-800 mb-4">Freelancer Dashboard</h2>
					<p className="text-gray-600">
						This is the freelancer dashboard view. Implementation will be added in the future.
					</p>
				</div>
			</main>
		</div>
	);
};

export default FreelancerDashboardPage; 