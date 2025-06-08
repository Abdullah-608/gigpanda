import { motion } from "framer-motion";
import { MessageSquare, Briefcase, BookmarkIcon, BellIcon, User, Menu, LogOut, ChevronDown, RefreshCw, Plus, Award } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { usePostStore } from "../store/postStore";
import { useJobStore } from "../store/jobStore";
import { useContractStore } from "../store/contractStore";
import SearchBar from "../components/SearchBar";
import Post from "../components/Post";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import CreateJobModal from "../components/CreateJobModal";
import MessagesPage from "../pages/MessagesPage";
import ClientJobsTab from "../components/ClientJobsTab";
import { useNotificationStore } from "../store/notificationStore";
import { format } from 'date-fns';

const ClientDashboardPage = () => {
	const { user, logout, activeTab, setActiveTab } = useAuthStore();
	const { posts, isLoading, error, pagination, fetchPosts, loadMorePosts } = usePostStore();
	const { hotJobs, isLoadingHotJobs, fetchHotJobs, fetchMyJobs } = useJobStore();
	const { getMyContracts } = useContractStore();
	const { topFreelancers, isLoadingFreelancers, fetchTopFreelancers } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, loadMoreNotifications, pagination: notificationPagination, isLoading: notificationLoading } = useNotificationStore();
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
	const notificationRef = useRef(null);
	const notificationListRef = useRef(null);
	const [lastFetchTime, setLastFetchTime] = useState(null);
	const FETCH_COOLDOWN = 5 * 60 * 1000; // 5 minutes

	// Function to check if we should fetch data
	const shouldFetchData = useCallback(() => {
		if (!lastFetchTime) return true;
		return Date.now() - lastFetchTime > FETCH_COOLDOWN;
	}, [lastFetchTime]);

	// Function to load jobs data
	const loadJobsData = useCallback(async (force = false) => {
		if (force || shouldFetchData()) {
			try {
				await Promise.all([
					fetchMyJobs(),
					getMyContracts()
				]);
				setLastFetchTime(Date.now());
			} catch (error) {
				console.error('Error loading jobs data:', error);
			}
		}
	}, [fetchMyJobs, getMyContracts, shouldFetchData]);

	useEffect(() => {
		fetchPosts();
		fetchTopFreelancers(2);
		fetchHotJobs(4);
		fetchNotifications();
		
		// Set active tab from location state if available
		if (location.state?.activeTab) {
			setActiveTab(location.state.activeTab);
		}
		
		const handleClickOutside = (event) => {
			if (notificationRef.current && !notificationRef.current.contains(event.target)) {
				setIsNotificationOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [fetchPosts, fetchTopFreelancers, fetchHotJobs, fetchNotifications, location.state?.activeTab, setActiveTab]);

	// Load jobs data when switching to jobs tab
	useEffect(() => {
		if (activeTab === 'myjobs') {
			loadJobsData();
		}
	}, [activeTab, loadJobsData]);

	// Check if user has the correct role
	if (user?.role === "freelancer") {
		return <Navigate to="/freelancer-dashboard" replace />;
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

	const handleRefreshPosts = async () => {
		try {
			await fetchPosts(1, 10, 'all');
		} catch (error) {
			console.error('Failed to refresh posts:', error);
		}
	};

	const handleLoadMore = async () => {
		if (pagination.hasNextPage && !isLoading) {
			try {
				await loadMorePosts();
			} catch (error) {
				console.error('Failed to load more posts:', error);
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

	const handleNotificationClick = (notification) => {
		if (!notification.read) {
			markAsRead([notification._id]);
		}

		// Handle navigation based on notification type
		switch (notification.type) {
			case 'NEW_PROPOSAL':
				if (notification.job) {
					setActiveTab('myjobs');
				}
				break;
			case 'NEW_MESSAGE':
				setActiveTab('messages');
				break;
			case 'MILESTONE_SUBMITTED':
				if (notification.job) {
					setActiveTab('myjobs');
				}
				break;
		}
		setIsNotificationOpen(false);
	};

	// Add scroll handler for infinite scroll
	const handleNotificationScroll = () => {
		if (!notificationListRef.current) return;
		
		const { scrollTop, scrollHeight, clientHeight } = notificationListRef.current;
		if (scrollHeight - scrollTop <= clientHeight * 1.5) {
			loadMoreNotifications();
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Custom scrollbar styles */}
			<style>
				{`
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
				`}
			</style>
			
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
									onClick={() => setActiveTab("dashboard")}
									className={`border-b-2 px-1 pt-5 pb-4 text-sm font-medium ${
										activeTab === "dashboard"
											? "border-gray-800 text-gray-900"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									Dashboard
								</button>
								<button
									onClick={() => setActiveTab("myjobs")}
									className={`border-b-2 px-1 pt-5 pb-4 text-sm font-medium ${
										activeTab === "myjobs"
											? "border-gray-800 text-gray-900"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									My Jobs
								</button>
								<button
									onClick={() => setActiveTab("messages")}
									className={`border-b-2 px-1 pt-5 pb-4 text-sm font-medium ${
										activeTab === "messages"
											? "border-gray-800 text-gray-900"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									}`}
								>
									Messages
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
										onClick={() => {
											setIsNotificationOpen(!isNotificationOpen);
											if (!isNotificationOpen && unreadCount > 0) {
												markAllAsRead();
											}
										}}
									>
										<BellIcon className="h-5 w-5" />
										{unreadCount > 0 && (
											<span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 ring-2 ring-white text-white text-xs flex items-center justify-center">
												{unreadCount}
											</span>
										)}
									</button>

									{isNotificationOpen && (
										<div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[80vh] overflow-hidden z-50">
											<div className="p-4 border-b border-gray-200">
												<h3 className="text-lg font-semibold">Notifications</h3>
											</div>
											
											<div 
												ref={notificationListRef}
												onScroll={handleNotificationScroll}
												className="divide-y divide-gray-200 overflow-y-auto max-h-[calc(80vh-4rem)]"
											>
												{notifications.length === 0 ? (
													<div className="p-4 text-center text-gray-500">
														No notifications
													</div>
												) : (
													<>
														{notifications.map((notification) => {
															const senderName = notification.sender?.name || 'Someone';
															const jobTitle = notification.job?.title || 'a job';
															
															return (
																<div
																	key={notification._id}
																	onClick={() => handleNotificationClick(notification)}
																	className={`block p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
																		!notification.read ? 'bg-blue-50' : ''
																	}`}
																>
																	<div className="flex items-start gap-3">
																		<img
																			src={notification.sender?.profile?.pictureUrl || '/default-avatar.png'}
																			alt={senderName}
																			className="w-10 h-10 rounded-full object-cover"
																		/>
																		<div className="flex-1">
																			<p className="text-sm text-gray-800">
																				{(() => {
																					switch (notification.type) {
																						case 'NEW_PROPOSAL':
																							return (
																								<>
																									<span className="font-semibold">{senderName}</span> submitted a proposal for "
																									<span className="font-semibold">{jobTitle}</span>"
																								</>
																						);
																						case 'NEW_MESSAGE':
																							return (
																								<>
																									New message from <span className="font-semibold">{senderName}</span>
																								</>
																						);
																						case 'MILESTONE_SUBMITTED':
																							return (
																								<>
																									<span className="font-semibold">{senderName}</span> submitted work for a milestone in "
																									<span className="font-semibold">{jobTitle}</span>"
																								</>
																						);
																						default:
																							return notification.message || 'New notification';
																					}
																				})()}
																			</p>
																			<p className="text-xs text-gray-500 mt-1">
																				{format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
																			</p>
																		</div>
																		{!notification.read && (
																			<div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
																		)}
																	</div>
																</div>
															);
														})}
														{notificationPagination.hasMore && (
															<div className="p-4 text-center">
																{notificationLoading ? (
																	<div className="flex items-center justify-center">
																		<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
																	</div>
																) : (
																	<button
																		onClick={() => loadMoreNotifications()}
																		className="text-sm text-gray-600 hover:text-gray-900"
																	>
																		Load More
																	</button>
																)}
															</div>
														)}
													</>
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
			
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{activeTab === "dashboard" ? (
				<div className="flex flex-col md:flex-row gap-6">
					{/* Left section (40%) - Real posts from freelancers */}
					<div className="w-full md:w-5/12">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-gray-800">Latest Posts</h2>
								< div className="flex items-center space-x-2">
									<button 
										onClick={handleRefreshPosts}
										disabled={isLoading}
										className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
									>
										<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
									</button>
									<button className="text-sm text-green-600 hover:text-green-800 font-medium">View All</button>
								</div>
							</div>
							
							<div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
								{/* Loading State */}
								{isLoading && posts.length === 0 && (
									<div className="flex items-center justify-center h-full">
										<div className="text-center">
											<RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
											<p className="text-sm text-gray-500">Loading posts...</p>
										</div>
									</div>
								)}

								{/* Error State */}
								{error && (
									<div className="flex items-center justify-center h-full">
										<div className="text-center">
											<p className="text-sm text-red-600 mb-2">{error}</p>
											<button 
												onClick={handleRefreshPosts}
												className="text-sm text-blue-600 hover:text-blue-800"
											>
												Try again
											</button>
										</div>
									</div>
								)}

								{/* Empty State */}
								{!isLoading && !error && posts.length === 0 && (
									<div className="flex items-center justify-center h-full">
										<div className="text-center">
											<MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
											<h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
											<p className="text-sm text-gray-500 mb-4">Be the first to share something with the community!</p>
											<button 
												onClick={handleRefreshPosts}
												className="text-sm text-blue-600 hover:text-blue-800"
											>
												Refresh
											</button>
										</div>
									</div>
								)}

								{/* Real Posts */}
								{posts.length > 0 && (
									<div className="space-y-4">
										{posts.map((post, index) => (
											<Post key={post.id} post={post} index={index} />
										))}
										
										{/* Load More Button */}
										{pagination.hasNextPage && (
											<div className="flex justify-center mt-4">
												<button
													onClick={handleLoadMore}
													disabled={isLoading}
													className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
												>
													{isLoading ? (
														<>
															<RefreshCw className="h-4 w-4 animate-spin mr-2 inline" />
															Loading...
														</>
													) : (
														'Load More'
													)}
												</button>
											</div>
										)}
									</div>
								)}
							</div>
						</motion.div>
					</div>

					{/* Right section (60%) - Hot Freelancers and Hot Gigs */}
					<div className="w-full md:w-7/12 flex flex-col gap-6">
						{/* Top right - Hot Freelancers */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-gray-800">Hot Freelancers</h2>
								<button className="text-sm text-green-600 hover:text-green-800 font-medium">See All</button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Loading state */}
								{isLoadingFreelancers && (
									<div className="col-span-2 flex items-center justify-center py-8">
										<div className="text-center">
											<div className="h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
											<p className="text-sm text-gray-500">Loading top freelancers...</p>
										</div>
									</div>
								)}

								{/* Error state */}
								{!isLoadingFreelancers && error && (
									<div className="col-span-2 text-center py-8">
										<p className="text-sm text-red-600 mb-2">Failed to load freelancers</p>
										<button 
											onClick={() => fetchTopFreelancers(2)}
											className="text-sm text-green-600 hover:text-green-700"
										>
											Try again
										</button>
									</div>
								)}

								{/* Empty state */}
								{!isLoadingFreelancers && !error && topFreelancers.length === 0 && (
									<div className="col-span-2 text-center py-8">
										<User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
										<p className="text-sm text-gray-500">No freelancers found</p>
									</div>
								)}

								{/* Real freelancers */}
								{!isLoadingFreelancers && !error && topFreelancers.map((freelancer, index) => (
									<div key={freelancer.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
										<div className="flex items-center space-x-3">
											<div className="flex-shrink-0">
												{freelancer.avatar ? (
													<img 
														src={freelancer.avatar} 
														alt={freelancer.name}
														className="h-12 w-12 rounded-full object-cover"
													/>
												) : (
													<div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
														index === 0 ? 'bg-red-500' : 'bg-blue-500'
													}`}>
														{freelancer.name.charAt(0).toUpperCase()}
													</div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-gray-900">{freelancer.name}</p>
												<p className="text-xs text-gray-500 truncate">
													{freelancer.bio || 'Professional Freelancer'}
												</p>
												<div className="flex items-center mt-1">
													<div className="flex items-center space-x-1 text-xs text-gray-500">
														<Award className="h-3 w-3" />
														<span>{freelancer.totalOrders} orders</span>
													</div>
													{freelancer.country && (
														<span className="text-xs text-gray-400 ml-2">• {freelancer.country}</span>
													)}
												</div>
											</div>
											<button className="flex-shrink-0 px-3 py-1 text-xs bg-green-100 text-green-700 font-medium rounded-full hover:bg-green-200">
												View
											</button>
										</div>
										<div className="mt-3 flex flex-wrap gap-1">
											{freelancer.skills?.slice(0, 3).map((skill, skillIndex) => (
												<span
													key={skillIndex}
													className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
												>
													{skill}
												</span>
											))}
											{freelancer.skills?.length > 3 && (
												<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
													+{freelancer.skills.length - 3} more
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						</motion.div>

						{/* Bottom right - Hot Gigs */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-gray-800">Hot Gigs</h2>
								<button className="text-sm text-green-600 hover:text-green-800 font-medium">Browse All</button>
							</div>
							
							<div className="space-y-4">
								{/* Loading state */}
								{isLoadingHotJobs && (
									<div className="flex items-center justify-center py-8">
										<div className="text-center">
											<div className="h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
											<p className="text-sm text-gray-500">Loading hot gigs...</p>
										</div>
									</div>
								)}

								{/* Error state */}
								{!isLoadingHotJobs && error && (
									<div className="text-center py-8">
										<p className="text-sm text-red-600 mb-2">Failed to load hot gigs</p>
										<button 
											onClick={() => fetchHotJobs(4)}
											className="text-sm text-green-600 hover:text-green-700"
										>
											Try again
										</button>
									</div>
								)}

								{/* Empty state */}
								{!isLoadingHotJobs && !error && hotJobs.length === 0 && (
									<div className="text-center py-8">
										<Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-2" />
										<p className="text-sm text-gray-500">No hot gigs available</p>
									</div>
								)}

								{/* Real hot jobs */}
									{!isLoadingHotJobs && !error && hotJobs.map((job) => (
									<div key={job._id} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
										<div className="flex justify-between">
											<h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{job.title}</h3>
											<div className="text-sm font-medium text-green-600">
												{formatBudget(job.budget, job.budgetType)}
											</div>
										</div>
										<p className="mt-1 text-xs text-gray-500">
											Posted {getTimeAgo(job.createdAt)} • {job.applicationCount} applications
										</p>
										<p className="mt-2 text-sm text-gray-700 line-clamp-2">
											{job.description}
										</p>
										<div className="mt-2 flex items-center justify-between">
											<span className="text-xs text-gray-500">By {job.client?.name || 'Anonymous'}</span>
											<span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
												{job.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
											</span>
										</div>
									</div>
								))}
							</div>
						</motion.div>
					</div>
				</div>
				) : activeTab === "myjobs" ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold text-gray-900">My Jobs</h2>
							<button
								onClick={() => setIsCreateModalOpen(true)}
								className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
							>
								<Plus className="w-5 h-5 mr-2" />
								Post New Job
							</button>
						</div>
						<ClientJobsTab onRefresh={() => loadJobsData(true)} />
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
				) : null}
			</main>

			{/* Floating Action Button */}
			<motion.button
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				onClick={() => setIsCreateModalOpen(true)}
				className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center z-40"
			>
				<Plus className="h-6 w-6" />
			</motion.button>

			{/* Create Job Modal */}
			<CreateJobModal 
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</div>
	);
};

export default ClientDashboardPage; 