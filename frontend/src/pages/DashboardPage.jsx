import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../utils/date";
import { BookmarkIcon, BellIcon, User, MessageSquare, Briefcase, Star, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const DashboardPage = () => {
	const { user, logout } = useAuthStore();
	const [isClient, setIsClient] = useState(true); // Set based on user role, for now hardcoding as client
	const navigate = useNavigate();
	
	useEffect(() => {
		// Check user role and set client state
		setIsClient(user?.role !== "freelancer");
	}, [user]);

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Custom scrollbar styles */}
			<style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: #f1f1f1;
					border-radius: 10px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #c1c1c1;
					border-radius: 10px;
					transition: background 0.2s ease;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #a1a1a1;
				}
				.custom-scrollbar {
					scrollbar-width: thin;
					scrollbar-color: #c1c1c1 #f1f1f1;
					scroll-behavior: smooth;
				}
			`}</style>
			
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
									Projects
								</a>
								<a href="#" className="border-b-2 border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700 px-1 pt-5 pb-4 text-sm font-medium">
									Messages
								</a>
								<a href="#" className="border-b-2 border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700 px-1 pt-5 pb-4 text-sm font-medium">
									Find Work
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

			{/* Main content */}
			<main className="w-full px-4 sm:px-6 lg:px-8 py-6">
				{isClient ? (
					<ClientDashboard user={user} />
				) : (
					<FreelancerDashboard user={user} />
				)}
			</main>
		</div>
	);
};

const ClientDashboard = ({ user }) => {
	return (
		<div className="flex flex-col md:flex-row gap-6">
			{/* Left section (40%) - New posts from freelancers */}
			<div className="w-full md:w-5/12">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
				>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-800">Latest Posts</h2>
						<button className="text-sm text-green-600 hover:text-green-800 font-medium">View All</button>
					</div>
					
					<div className="h-[500px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
						{/* Sample Post 1 */}
						<motion.div 
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.1 }}
							className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
						>
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
										TS
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900">
										Tom Smith <span className="text-sm font-normal text-gray-500">shared a post</span>
									</p>
									<p className="text-sm text-gray-500">Web Designer • 2 hours ago</p>
									<div className="mt-2">
										<p className="text-sm text-gray-700">Just finished a new portfolio project using React and Tailwind CSS. Check it out!</p>
										<div className="mt-3 flex items-start space-x-2">
											<img src="https://via.placeholder.com/300x200/e2e8f0/64748b?text=Portfolio+Preview" alt="Project preview" className="h-40 w-60 object-cover rounded-md"/>
										</div>
									</div>
									<div className="mt-3 flex items-center space-x-4">
										<button className="text-gray-500 hover:text-green-600 text-sm flex items-center space-x-1">
											<Star className="h-4 w-4" />
											<span>Like</span>
										</button>
										<button className="text-gray-500 hover:text-green-600 text-sm flex items-center space-x-1">
											<MessageSquare className="h-4 w-4" />
											<span>Comment</span>
										</button>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Sample Post 2 */}
						<motion.div 
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2 }}
							className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
						>
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
										AJ
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900">
										Alex Johnson <span className="text-sm font-normal text-gray-500">is available for work</span>
									</p>
									<p className="text-sm text-gray-500">Full-Stack Developer • 5 hours ago</p>
									<div className="mt-2">
										<p className="text-sm text-gray-700">I've just completed a major project and am now available for new opportunities. Specialized in MERN stack development with 5 years of experience.</p>
										<div className="mt-3 flex flex-wrap gap-2">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												React
											</span>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												Node.js
											</span>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
												MongoDB
											</span>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
												Express
											</span>
										</div>
									</div>
									<div className="mt-3 flex items-center space-x-4">
										<button className="text-gray-500 hover:text-green-600 text-sm flex items-center space-x-1">
											<Star className="h-4 w-4" />
											<span>Like</span>
										</button>
										<button className="text-gray-500 hover:text-green-600 text-sm flex items-center space-x-1">
											<MessageSquare className="h-4 w-4" />
											<span>Comment</span>
										</button>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Sample Post 3 */}
						<motion.div 
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
							className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
						>
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
										MP
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900">
										Maria Patel <span className="text-sm font-normal text-gray-500">shared a new article</span>
									</p>
									<p className="text-sm text-gray-500">UI/UX Designer • Yesterday</p>
									<div className="mt-2">
										<p className="text-sm font-medium text-gray-900">10 UI Design Trends for 2025</p>
										<p className="text-sm text-gray-700 mt-1">Check out my new article on the upcoming UI design trends that will dominate next year...</p>
									</div>
									<div className="mt-3 flex items-center space-x-4">
										<button className="text-gray-500 hover:text-green-600 text-sm flex items-center space-x-1">
											<Star className="h-4 w-4" />
											<span>Like</span>
										</button>
										<button className="text-gray-500 hover:text-green-600 text-sm flex items-center space-x-1">
											<MessageSquare className="h-4 w-4" />
											<span>Comment</span>
										</button>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</motion.div>
			</div>

			{/* Right section (60%) - Split into top and bottom sections */}
			<div className="w-full md:w-7/12 flex flex-col gap-6">
				{/* Top right - Recommended freelancers and hot gigs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
				>
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-800">Recommended For You</h2>
						<button className="text-sm text-green-600 hover:text-green-800 font-medium">See All</button>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Freelancer 1 */}
						<div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
							<div className="flex items-center space-x-3">
								<div className="flex-shrink-0">
									<div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold">
										DC
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900">David Chen</p>
									<p className="text-xs text-gray-500">Mobile App Developer</p>
									<div className="flex items-center mt-1">
										<div className="flex">
											{[...Array(5)].map((_, i) => (
												<Star className={`h-3 w-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
											))}
										</div>
										<span className="text-xs text-gray-500 ml-1">4.0 (28 reviews)</span>
									</div>
								</div>
								<button className="flex-shrink-0 px-3 py-1 text-xs bg-green-100 text-green-700 font-medium rounded-full hover:bg-green-200">
									View
								</button>
							</div>
							<div className="mt-3 flex flex-wrap gap-1">
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
									Flutter
								</span>
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
									Firebase
								</span>
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
									iOS
								</span>
							</div>
						</div>

						{/* Freelancer 2 */}
						<div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
							<div className="flex items-center space-x-3">
								<div className="flex-shrink-0">
									<div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
										SK
									</div>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900">Sarah Kim</p>
									<p className="text-xs text-gray-500">UI/UX Designer</p>
									<div className="flex items-center mt-1">
										<div className="flex">
											{[...Array(5)].map((_, i) => (
												<Star className={`h-3 w-3 ${i < 5 ? 'text-yellow-400' : 'text-gray-300'}`} />
											))}
										</div>
										<span className="text-xs text-gray-500 ml-1">5.0 (43 reviews)</span>
									</div>
								</div>
								<button className="flex-shrink-0 px-3 py-1 text-xs bg-green-100 text-green-700 font-medium rounded-full hover:bg-green-200">
									View
								</button>
							</div>
							<div className="mt-3 flex flex-wrap gap-1">
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
									Figma
								</span>
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
									Adobe XD
								</span>
								<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
									Prototyping
								</span>
							</div>
						</div>
					</div>

					<div className="mt-8">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-gray-800">Hot Gigs</h2>
							<button className="text-sm text-green-600 hover:text-green-800 font-medium">Browse All</button>
						</div>
						
						<div className="space-y-4">
							{/* Gig 1 */}
							<div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
								<div className="flex justify-between">
									<h3 className="text-sm font-semibold text-gray-900">Website Redesign for E-commerce Platform</h3>
									<div className="text-sm font-medium text-green-600">$2,500</div>
								</div>
								<p className="mt-1 text-xs text-gray-500">Posted 2 days ago</p>
								<p className="mt-2 text-sm text-gray-700 line-clamp-2">
									Looking for an experienced web designer to redesign our e-commerce platform...
								</p>
							</div>
							
							{/* Gig 2 */}
							<div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
								<div className="flex justify-between">
									<h3 className="text-sm font-semibold text-gray-900">Mobile App Development - Fitness Tracker</h3>
									<div className="text-sm font-medium text-green-600">$5,000</div>
								</div>
								<p className="mt-1 text-xs text-gray-500">Posted 3 days ago</p>
								<p className="mt-2 text-sm text-gray-700 line-clamp-2">
									We need a talented mobile developer to create a fitness tracking app...
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Bottom right - Reserved space for future development */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 h-64 flex items-center justify-center"
				>
					<div className="text-center">
						<Briefcase className="h-10 w-10 text-gray-300 mx-auto" />
						<p className="mt-2 text-sm text-gray-500">This space is reserved for future development</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

const FreelancerDashboard = ({ user }) => {
	// This is a placeholder for the freelancer dashboard
	return (
		<div className="w-full bg-white rounded-xl shadow-sm p-6 border border-gray-100">
			<h2 className="text-xl font-bold text-gray-800 mb-4">Freelancer Dashboard</h2>
			<p className="text-gray-600">
				This is the freelancer dashboard view. Your implementation is focused on the client dashboard.
			</p>
		</div>
	);
};

export default DashboardPage;
