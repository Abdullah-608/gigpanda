import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useJobStore } from "../store/jobStore";
import { BookmarkIcon, BellIcon, User, Menu, LogOut, ChevronDown, DollarSign, Briefcase, Clock, MessageSquare, Award, Loader, Filter } from "lucide-react";
import SearchBar from "../components/SearchBar";
import CreateProposalModal from "../components/CreateProposalModal";
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import MyProposalsPage from "./MyProposalsPage";
import MessagesPage from "./MessagesPage";
import { useNotificationStore } from "../store/notificationStore";
import { format } from 'date-fns';
import AcceptedWorkTab from "../components/AcceptedWorkTab";

const FreelancerDashboardPage = () => {
	const { user, logout, activeTab, setActiveTab } = useAuthStore();
	const { jobs, isLoading, error, pagination, fetchJobs, loadMoreJobs } = useJobStore();
	const navigate = useNavigate();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
	const [selectedJob, setSelectedJob] = useState(null);
	const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
	const notificationRef = useRef(null);
	
	useEffect(() => {
		fetchJobs();
		fetchNotifications();
		
		const handleClickOutside = (event) => {
			if (notificationRef.current && !notificationRef.current.contains(event.target)) {
				setIsNotificationOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [fetchJobs, fetchNotifications]);
	
	// Check if user has the correct role
	if (user?.role !== "freelancer") {
		return <Navigate to="/client-dashboard" replace />;
	}

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

	const handleApplyToJob = (job) => {
		setSelectedJob(job);
		setIsProposalModalOpen(true);
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

	const handleNotificationClick = (notification) => {
		if (!notification.read) {
			markAsRead([notification._id]);
		}

		// Handle navigation based on notification type
		switch (notification.type) {
			case 'NEW_PROPOSAL':
			case 'PROPOSAL_ACCEPTED':
			case 'PROPOSAL_REJECTED':
				navigate(`/jobs/${notification.job._id}`);
				break;
			case 'NEW_MESSAGE':
				setActiveTab('messages');
				break;
			case 'MILESTONE_APPROVED':
			case 'MILESTONE_CHANGES_REQUESTED':
				navigate(`/jobs/${notification.job._id}`);
				break;
			case 'CONTRACT_COMPLETED':
				setActiveTab('accepted-work');
				navigate(`/contracts/${notification.job._id}`);
				break;
		}
		setIsNotificationOpen(false);
	};

	return (
		<div className="min-h-screen bg-white w-full" onClick={closeDropdown}>
			{/* Custom scrollbar styles */}
			<style>{`
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
								<button
									onClick={() => setActiveTab('dashboard')}
									className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										activeTab === 'dashboard'
											? 'border-green-500 text-gray-900'
											: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
									}`}
								>
									Dashboard
								</button>
								<button
									onClick={() => setActiveTab('proposals')}
									className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										activeTab === 'proposals'
											? 'border-green-500 text-gray-900'
											: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
									}`}
								>
									My Proposals
								</button>
								<button
									onClick={() => setActiveTab('messages')}
									className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										activeTab === 'messages'
											? 'border-green-500 text-gray-900'
											: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
									}`}
								>
									Messages
								</button>
								<button
									onClick={() => setActiveTab('accepted-work')}
									className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
										activeTab === 'accepted-work'
											? 'border-green-500 text-gray-900'
											: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
									}`}
								>
									Accepted Work
								</button>
							</div>
						</div>
						<div className="flex items-center">
							<div className="flex-shrink-0 flex items-center space-x-4">
								{/* Search component */}
								<SearchBar />
								<button type="button" className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none">
									<BookmarkIcon className="h-5 w-5" />
								</button>
								<div className="relative" ref={notificationRef}>
									<button 
										type="button" 
										className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none relative"
										onClick={() => setIsNotificationOpen(!isNotificationOpen)}
									>
									<BellIcon className="h-5 w-5" />
										{unreadCount > 0 && (
											<span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 ring-2 ring-white text-white text-xs flex items-center justify-center">
												{unreadCount}
											</span>
										)}
								</button>

									{isNotificationOpen && (
										<div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
											<div className="p-4 border-b border-gray-200">
												<h3 className="text-lg font-semibold">Notifications</h3>
											</div>
											
											<div className="divide-y divide-gray-200">
												{notifications.length === 0 ? (
													<div className="p-4 text-center text-gray-500">
														No notifications
													</div>
												) : (
													notifications.map((notification) => (
														<div
															key={notification._id}
															onClick={() => handleNotificationClick(notification)}
															className={`block p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
																!notification.read ? 'bg-blue-50' : ''
															}`}
														>
															<div className="flex items-start gap-3">
																<img
																	src={notification.sender.profile?.pictureUrl || '/default-avatar.png'}
																	alt={notification.sender.name}
																	className="w-10 h-10 rounded-full object-cover"
																/>
																<div className="flex-1">
																	<p className="text-sm text-gray-800">
																		{(() => {
																			const senderName = notification.sender.name;
																			switch (notification.type) {
																				case 'NEW_PROPOSAL':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> submitted a proposal for "
																							<span className="font-semibold">{notification.job.title}</span>"
																						</>
																					);
																				case 'PROPOSAL_ACCEPTED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> accepted your proposal for "
																							<span className="font-semibold">{notification.job.title}</span>"
																						</>
																					);
																				case 'PROPOSAL_REJECTED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> declined your proposal for "
																							<span className="font-semibold">{notification.job.title}</span>"
																						</>
																					);
																				case 'NEW_MESSAGE':
																					return (
																						<>
																							New message from <span className="font-semibold">{senderName}</span>
																						</>
																					);
																				case 'CONTRACT_COMPLETED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> has completed the contract for "
																							<span className="font-semibold">{notification.job.title}</span>"
																							<span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
																								Contract Completed
																							</span>
																						</>
																					);
																				case 'MILESTONE_APPROVED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> approved your milestone submission for "
																							<span className="font-semibold">{notification.job.title}</span>"
																						</>
																					);
																				case 'MILESTONE_CHANGES_REQUESTED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> requested changes for your milestone submission in "
																							<span className="font-semibold">{notification.job.title}</span>"
																						</>
																					);
																				default:
																					return notification.message || 'New notification';
																			}
																		})()}
																	</p>
																	<div className="flex items-center mt-1 space-x-2">
																		<p className="text-xs text-gray-500">
																		{format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
																	</p>
																		{notification.type === 'CONTRACT_COMPLETED' && (
																			<span className="text-xs text-gray-500">
																				• Final milestone completed
																			</span>
																		)}
																	</div>
																</div>
																{!notification.read && (
																	<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
																)}
															</div>
														</div>
													))
												)}
											</div>
										</div>
									)}
								</div>
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
				{activeTab === "dashboard" ? (
					<>
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
															<span>{job.proposalCount || 0} proposals</span>
														</div>
														<div className="flex items-center space-x-2">
															<button className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-50">
																<BookmarkIcon className="h-4 w-4" />
															</button>
															<button 
																onClick={() => handleApplyToJob(job)}
																className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
															>
																Send Proposal
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
					</>
				) : activeTab === "proposals" ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-xl shadow-sm"
					>
						<MyProposalsPage />
					</motion.div>
				) : activeTab === "messages" ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-xl shadow-sm"
					>
						<MessagesPage />
					</motion.div>
				) : activeTab === "accepted-work" ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-xl shadow-sm"
					>
						<AcceptedWorkTab />
					</motion.div>
				) : null}
			</main>

			{/* Proposal Modal */}
			<CreateProposalModal
				isOpen={isProposalModalOpen}
				onClose={() => {
					setIsProposalModalOpen(false);
					setSelectedJob(null);
				}}
				job={selectedJob}
			/>
		</div>
	);
};

export default FreelancerDashboardPage; 