import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useJobStore } from "../store/jobStore";
import { BookmarkIcon, BellIcon, User, Menu, LogOut, ChevronDown, DollarSign, Briefcase, Clock, TrendingUp, Eye, Heart, MessageSquare, Star, Award, Calendar, Filter, Search, Edit3, Loader } from "lucide-react";
import SearchBar from "../components/SearchBar";
import CreatePostModal from "../components/CreatePostModal";
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const FreelancerDashboardPage = () => {
	const { user, logout } = useAuthStore();
	const { jobs, isLoading, error, pagination, fetchJobs, loadMoreJobs, applyToJob, isApplying } = useJobStore();
	const navigate = useNavigate();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
	
	// Check if user has the correct role
	if (user?.role !== "freelancer") {
		return <Navigate to="/client-dashboard" replace />;
	}
	
	// Fetch jobs when component mounts
	useEffect(() => {
		fetchJobs();
	}, [fetchJobs]);
	
	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	// Close dropdown when clicking outside
	const closeDropdown = () => {
		setIsDropdownOpen(false);
	};

	const handleApplyToJob = async (jobId) => {
		// For now, show a simple prompt. Later you can create a proper application modal
		const proposalText = prompt("Enter your proposal:");
		const proposedBudget = prompt("Enter your proposed budget:");
		const estimatedDuration = prompt("Enter estimated duration:");

		if (proposalText && proposedBudget && estimatedDuration) {
			try {
				await applyToJob(jobId, {
					proposalText,
					proposedBudget: parseFloat(proposedBudget),
					estimatedDuration
				});
				toast.success("Application submitted successfully!");
			} catch (error) {
				toast.error(error.message || "Failed to submit application");
			}
		}
	};

	const handleLoadMore = async () => {
		if (pagination.hasNextPage && !isLoading) {
			try {
				await loadMoreJobs();
			} catch (error) {
				console.error('Failed to load more jobs:', error);
			}
		}
	};

	const formatBudget = (budget, budgetType) => {
		if (budgetType === 'hourly') {
			return `$${budget.min} - $${budget.max}/hr`;
		} else {
			return `$${budget.min} - $${budget.max}`;
		}
	};

	const getTimeAgo = (date) => {
		const now = new Date();
		const posted = new Date(date);
		const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
		
		if (diffInHours < 1) return 'Just now';
		if (diffInHours === 1) return '1 hour ago';
		if (diffInHours < 24) return `${diffInHours} hours ago`;
		
		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays === 1) return '1 day ago';
		return `${diffInDays} days ago`;
	};

	// Mock data for other sections (keep these for now)
	const mockActiveProjects = [
		{
			id: 1,
			title: "E-commerce Website Redesign",
			client: "TechCorp Solutions",
			deadline: "2024-02-15",
			progress: 75,
			budget: 2500,
			status: "In Progress"
		},
		{
			id: 2,
			title: "Mobile App UI/UX Design",
			client: "StartupXYZ",
			deadline: "2024-02-20",
			progress: 45,
			budget: 1800,
			status: "In Progress"
		},
		{
			id: 3,
			title: "Logo Design & Branding",
			client: "Creative Agency",
			deadline: "2024-02-10",
			progress: 90,
			budget: 800,
			status: "Review"
		}
	];

	const mockRecentActivity = [
		{ id: 1, type: "proposal", message: "Proposal sent for 'React Developer Position'", time: "2 hours ago" },
		{ id: 2, type: "message", message: "New message from TechCorp Solutions", time: "4 hours ago" },
		{ id: 3, type: "milestone", message: "Milestone completed for E-commerce project", time: "1 day ago" },
		{ id: 4, type: "payment", message: "Payment received: $1,200", time: "2 days ago" }
	];

	return (
		<div className="min-h-screen bg-white w-full" onClick={closeDropdown}>
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
				.line-clamp-2 {
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					overflow: hidden;
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
									Find Jobs
								</a>
								<a href="#" className="border-b-2 border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700 px-1 pt-5 pb-4 text-sm font-medium">
									My Proposals
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
									<span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
								</button>
								<div className="ml-3 relative">
									<div className="flex items-center">
										<button 
											className="bg-gray-100 flex items-center text-sm rounded-full focus:outline-none hover:bg-gray-200 transition-colors duration-200 px-2 py-1"
											onClick={(e) => {
												e.stopPropagation();
												toggleDropdown();
											}}
										>
											<span className="sr-only">Open user menu</span>
											<div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white mr-2">
												{user?.name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}
											</div>
											<span className="text-sm text-gray-700 hidden md:block mr-1">
												{user?.name || "User"}
											</span>
											<ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
										</button>
									</div>
									
									{/* Dropdown Menu */}
									{isDropdownOpen && (
										<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
											<div className="py-1">
												<div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
													<div className="font-medium">{user?.name || "User"}</div>
													<div className="text-gray-500">{user?.email}</div>
												</div>
												<a
													href="#"
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
													onClick={(e) => e.stopPropagation()}
												>
													Profile Settings
												</a>
												<a
													href="#"
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
													onClick={(e) => e.stopPropagation()}
												>
													Account Settings
												</a>
												<button
													className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center"
													onClick={(e) => {
														e.stopPropagation();
														handleLogout();
													}}
												>
													<LogOut className="h-4 w-4 mr-2" />
													Sign Out
												</button>
											</div>
										</div>
									)}
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
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
					>
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<DollarSign className="h-8 w-8 text-green-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
									<dd className="text-lg font-semibold text-gray-900">${(user?.totalEarnings || 0).toLocaleString()}</dd>
								</dl>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
					>
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<Briefcase className="h-8 w-8 text-purple-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
									<dd className="text-lg font-semibold text-gray-900">{user?.activeProjects || 0}</dd>
								</dl>
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
					>
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<Award className="h-8 w-8 text-blue-600" />
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
									<dd className="text-lg font-semibold text-gray-900">{user?.totalOrders || 0}</dd>
								</dl>
							</div>
						</div>
					</motion.div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Job Postings */}
					<div className="lg:col-span-2">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="bg-white rounded-xl shadow-sm border border-gray-100"
						>
							<div className="p-6 border-b border-gray-100">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-bold text-gray-800">Recommended Jobs</h2>
									<div className="flex items-center space-x-2">
										<button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
											<Filter className="h-4 w-4" />
										</button>
										<button className="text-sm text-green-600 hover:text-green-800 font-medium">View All</button>
									</div>
								</div>
							</div>
							
							<div className="h-[600px] overflow-y-auto custom-scrollbar">
								<div className="space-y-4 p-6">
									{/* Loading state */}
									{isLoading && jobs.length === 0 && (
										<div className="flex items-center justify-center py-12">
											<Loader className="h-6 w-6 animate-spin text-gray-500" />
											<span className="ml-2 text-gray-500">Loading jobs...</span>
										</div>
									)}

									{/* Error state */}
									{error && (
										<div className="text-center py-12">
											<p className="text-red-600 mb-2">Failed to load jobs</p>
											<button 
												onClick={() => fetchJobs()}
												className="text-sm text-green-600 hover:text-green-700"
											>
												Try again
											</button>
										</div>
									)}

									{/* Empty state */}
									{!isLoading && !error && jobs.length === 0 && (
										<div className="text-center py-12">
											<Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
											<p className="text-gray-500">No jobs available at the moment</p>
											<p className="text-sm text-gray-400">Check back later for new opportunities</p>
										</div>
									)}

									{/* Job listings */}
									{jobs.map((job, index) => (
										<motion.div
											key={job._id}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.1 * index }}
											className="p-5 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
													<div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
														<span className="flex items-center">
															<User className="h-4 w-4 mr-1" />
															{job.client?.name || 'Anonymous Client'}
														</span>
														<span className="flex items-center">
															<DollarSign className="h-4 w-4 mr-1" />
															{formatBudget(job.budget, job.budgetType)}
														</span>
														<span className="flex items-center">
															<Clock className="h-4 w-4 mr-1" />
															{job.timeline}
														</span>
													</div>

													{/* Job description (truncated) */}
													<p className="text-sm text-gray-600 mb-3 line-clamp-2">
														{job.description}
													</p>

													{/* Skills required */}
													<div className="flex flex-wrap gap-2 mb-4">
														{job.skillsRequired?.map((skill, skillIndex) => (
															<span
																key={skillIndex}
																className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
															>
																{skill}
															</span>
														))}
													</div>

													{/* Category and experience level */}
													<div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
														<span className="px-2 py-1 bg-gray-100 rounded">
															{job.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
														</span>
														<span className="px-2 py-1 bg-gray-100 rounded">
															{job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
														</span>
														<span className="px-2 py-1 bg-gray-100 rounded">
															{job.location.charAt(0).toUpperCase() + job.location.slice(1)}
														</span>
													</div>

													<div className="flex items-center justify-between">
														<div className="flex items-center space-x-4 text-sm text-gray-500">
															<span>{getTimeAgo(job.createdAt)}</span>
															<span>{job.applicationCount || 0} applications</span>
														</div>
														<div className="flex items-center space-x-2">
															<button className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-50">
																<BookmarkIcon className="h-4 w-4" />
															</button>
															<button 
																onClick={() => handleApplyToJob(job._id)}
																disabled={isApplying}
																className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
															>
																{isApplying ? (
																	<>
																		<Loader className="h-3 w-3 animate-spin" />
																		<span>Applying...</span>
																	</>
																) : (
																	<span>Send Proposal</span>
																)}
															</button>
														</div>
													</div>
												</div>
											</div>
										</motion.div>
									))}

									{/* Load more button */}
									{pagination.hasNextPage && (
										<div className="text-center pt-4">
											<button
												onClick={handleLoadMore}
												disabled={isLoading}
												className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
											>
												{isLoading ? (
													<>
														<Loader className="h-4 w-4 animate-spin" />
														<span>Loading...</span>
													</>
												) : (
													<span>Load More Jobs</span>
												)}
											</button>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					</div>

					{/* Right Column */}
					<div className="space-y-6">
						{/* Active Projects */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-lg font-bold text-gray-800">Active Projects</h2>
								<button className="text-sm text-green-600 hover:text-green-800 font-medium">View All</button>
							</div>
							
							<div className="space-y-4">
								{mockActiveProjects.map((project, index) => (
									<motion.div
										key={project.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.1 * index }}
										className="p-4 border border-gray-100 rounded-lg"
									>
										<h3 className="font-medium text-gray-900 mb-2">{project.title}</h3>
										<p className="text-sm text-gray-500 mb-3">{project.client}</p>
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm text-gray-500">Progress</span>
											<span className="text-sm font-medium text-gray-900">{project.progress}%</span>
										</div>
										<div className="w-full bg-gray-200 rounded-full h-2 mb-3">
											<div 
												className="bg-green-600 h-2 rounded-full transition-all duration-300" 
												style={{ width: `${project.progress}%` }}
											></div>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-500">Due: {new Date(project.deadline).toLocaleDateString()}</span>
											<span className="font-medium text-green-600">${project.budget}</span>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>

						{/* Recent Activity */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
							className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
								<button className="text-sm text-green-600 hover:text-green-800 font-medium">View All</button>
							</div>
							
							<div className="space-y-4">
								{mockRecentActivity.map((activity, index) => (
									<motion.div
										key={activity.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.1 * index }}
										className="flex items-start space-x-3"
									>
										<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
											activity.type === 'proposal' ? 'bg-blue-100 text-blue-600' :
											activity.type === 'message' ? 'bg-green-100 text-green-600' :
											activity.type === 'milestone' ? 'bg-purple-100 text-purple-600' :
											'bg-yellow-100 text-yellow-600'
										}`}>
											{activity.type === 'proposal' && <Briefcase className="h-4 w-4" />}
											{activity.type === 'message' && <MessageSquare className="h-4 w-4" />}
											{activity.type === 'milestone' && <Award className="h-4 w-4" />}
											{activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm text-gray-900">{activity.message}</p>
											<p className="text-xs text-gray-500">{activity.time}</p>
										</div>
									</motion.div>
								))}
							</div>
						</motion.div>
					</div>
				</div>
			</main>

			{/* Floating Write Button */}
			<motion.button
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				onClick={() => setIsCreatePostModalOpen(true)}
				className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
			>
				<Edit3 className="h-6 w-6" />
			</motion.button>

			{/* Create Post Modal */}
			<CreatePostModal 
				isOpen={isCreatePostModalOpen}
				onClose={() => setIsCreatePostModalOpen(false)}
			/>
		</div>
	);
};

export default FreelancerDashboardPage; 