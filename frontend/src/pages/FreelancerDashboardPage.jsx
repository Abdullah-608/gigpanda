import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useJobStore } from "../store/jobStore";
import { usePostStore } from "../store/postStore";
import { BookmarkIcon, BellIcon, User, Menu, LogOut, ChevronDown, DollarSign, Briefcase, Clock, MessageSquare, Award, Loader, Filter, Plus } from "lucide-react";
import SearchBar from "../components/SearchBar";
import CreateProposalModal from "../components/CreateProposalModal";
import CreatePostModal from "../components/CreatePostModal";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import MyProposalsPage from "./MyProposalsPage";
import MessagesPage from "./MessagesPage";
import { useNotificationStore } from "../store/notificationStore";
import { format } from 'date-fns';
import AcceptedWorkTab from "../components/AcceptedWorkTab";
import { useContractStore } from "../store/contractStore";
import styles from "./FreelancerDashboardPage.module.css";
import { useBookmarkStore } from "../store/bookmarkStore";
import BookmarksPage from "./BookmarkPage";
import ChatBot from '../components/ChatBot'

const FreelancerDashboardPage = () => {
	const { user, logout, activeTab, setActiveTab } = useAuthStore();
	const { jobs, isLoading, error, pagination, fetchJobs, loadMoreJobs } = useJobStore();
	const { fetchPosts } = usePostStore();
	const { contracts, getMyContracts } = useContractStore();
	const navigate = useNavigate();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
	const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
	const [selectedJob, setSelectedJob] = useState(null);
	const { isJobBookmarked, toggleBookmark, fetchBookmarks } = useBookmarkStore();
	
	const { 
		notifications, 
		unreadCount, 
		fetchNotifications, 
		markAsRead, 
		markAllAsRead, 
		loadMoreNotifications, 
		isLoading: notificationLoading, 
		pagination: notificationPagination 
	} = useNotificationStore();
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
	const notificationRef = useRef(null);
	const notificationListRef = useRef(null);
	const [lastFetchTime, setLastFetchTime] = useState(null);
	const FETCH_COOLDOWN = 5 * 60 * 1000; // 5 minutes
	const [stats, setStats] = useState({
		totalEarnings: 0,
		activeProjects: 0,
		totalOrders: 0
	});

	// Function to check if we should fetch data
	const shouldFetchData = useCallback(() => {
		if (!lastFetchTime) return true;
		return Date.now() - lastFetchTime > FETCH_COOLDOWN;
	}, [lastFetchTime]);

	// Function to calculate stats from contracts
	const calculateStats = (contracts) => {
		const newStats = {
			totalEarnings: 0,
			activeProjects: 0,
			totalOrders: 0
		};

		contracts.forEach(contract => {
			// Count active projects
			if (contract.status === 'active') {
				newStats.activeProjects++;
			}

			// Count completed orders
			if (contract.status === 'completed') {
				newStats.totalOrders++;
			}

			// Calculate total earnings from paid milestones
			if (contract.milestones) {
				contract.milestones.forEach(milestone => {
					if (milestone.status === 'paid') {
						newStats.totalEarnings += milestone.amount;
					}
				});
			}
		});

		setStats(newStats);
	};

	// Function to load initial data
const loadInitialData = useCallback(async (force = false) => {
    if (force || shouldFetchData()) {
      try {
        await Promise.all([
          fetchJobs(),
          fetchPosts(),
          fetchNotifications(),
          getMyContracts(),
          fetchBookmarks() // Add this line
        ]);
        setLastFetchTime(Date.now());
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    }
  }, [fetchJobs, fetchPosts, fetchNotifications, getMyContracts, fetchBookmarks, shouldFetchData]);
  
	
	useEffect(() => {
		loadInitialData();
		
		const handleClickOutside = (event) => {
			if (notificationRef.current && !notificationRef.current.contains(event.target)) {
				setIsNotificationOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [loadInitialData]);
	
	// Calculate stats when contracts change
	useEffect(() => {
		if (contracts) {
			calculateStats(contracts);
		}
	}, [contracts]);
	
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
 const handleToggleBookmark = async (e, jobId) => {
    e.stopPropagation(); // Prevent job card click
    await toggleBookmark(jobId);
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
				if (notification.job?._id) {
					navigate(`/jobs/${notification.job._id}`);
				}
				break;
			case 'NEW_MESSAGE':
				setActiveTab('messages');
				break;
			case 'MILESTONE_APPROVED':
			case 'MILESTONE_CHANGES_REQUESTED':
				if (notification.job?._id) {
					navigate(`/jobs/${notification.job._id}`);
				}
				break;
			case 'CONTRACT_COMPLETED':
				setActiveTab('accepted-work');
				if (notification.job?._id) {
					navigate(`/contracts/${notification.job._id}`);
				}
				break;
			case 'POST_LIKED':
			case 'POST_COMMENTED':
				if (notification.post?._id) {
					navigate(`/posts/${notification.post._id}`);
				}
				break;
			case 'POST_REACTION':
				if (notification.post?._id) {
					navigate(`/posts/${notification.post._id}`);
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
		<div className="min-h-screen bg-white w-full" onClick={closeDropdown}>
			<ChatBot/>
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
									onClick={() => setActiveTab("dashboard")}
									className={`${styles.navLink} ${
										activeTab === "dashboard" ? styles.navLinkActive : styles.navLinkInactive
									}`}
								>
									Dashboard
								</button>
								<button
									onClick={() => setActiveTab("proposals")}
									className={`${styles.navLink} ${
										activeTab === "proposals" ? styles.navLinkActive : styles.navLinkInactive
									}`}
								>
									Proposals
								</button>
								<button
									onClick={() => setActiveTab("messages")}
									className={`${styles.navLink} ${
										activeTab === "messages" ? styles.navLinkActive : styles.navLinkInactive
									}`}
								>
									Messages
								</button>
								<button
									onClick={() => setActiveTab("bookmarks")}
									className={`${styles.navLink} ${
										activeTab === "bookmarks" ? styles.navLinkActive : styles.navLinkInactive
									}`}
								>
									Bookmarks
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
								<button 
									type="button" 
									onClick={() => setActiveTab("bookmarks")}
									className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
								>
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
												{notificationLoading && notifications.length === 0 && (
													<div className="flex flex-col items-center justify-center py-8">
														<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
														<p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
													</div>
												)}
												
												{!notificationLoading && notifications.length === 0 && (
													<div className="p-4 text-center text-gray-500">
														No notifications
													</div>
												)}
												
												{notifications.length > 0 && (
													<>
														{notifications.map((notification) => (
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
																	alt={notification.sender?.name || 'Someone'}
																	className="w-10 h-10 rounded-full object-cover"
																/>
																<div className="flex-1">
																	<p className="text-sm text-gray-800">
																		{(() => {
																			const senderName = notification.sender?.name || 'Someone';
																			const jobTitle = notification.job?.title || 'Unknown Job';
																			switch (notification.type) {
																				case 'NEW_PROPOSAL':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> submitted a proposal for "
																							<span className="font-semibold">{jobTitle}</span>"
																						</>
																					);
																				case 'PROPOSAL_ACCEPTED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> accepted your proposal for "
																							<span className="font-semibold">{jobTitle}</span>"
																						</>
																					);
																				case 'PROPOSAL_REJECTED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> declined your proposal for "
																							<span className="font-semibold">{jobTitle}</span>"
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
																							<span className="font-semibold">{jobTitle}</span>"
																							<span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
																								Contract Completed
																							</span>
																						</>
																					);
																				case 'MILESTONE_APPROVED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> approved your milestone submission for "
																							<span className="font-semibold">{jobTitle}</span>"
																						</>
																					);
																				case 'MILESTONE_CHANGES_REQUESTED':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> requested changes for your milestone submission in "
																							<span className="font-semibold">{jobTitle}</span>"
																						</>
																					);
																					case 'POST_LIKED':
																						return (
																							<>
																								<span className="font-semibold">{senderName}</span> liked your post
																							</>
																						);
																					case 'POST_COMMENTED':
																						return (
																							<>
																								<span className="font-semibold">{senderName}</span> commented on your post
																							</>
																						);
																				case 'POST_REACTION':
																					return (
																						<>
																							<span className="font-semibold">{senderName}</span> reacted to your post with {notification.message}
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
														))}
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
												{user?.profile?.pictureUrl ? (
													<img 
														src={user.profile.pictureUrl} 
														alt={user.name} 
														className="h-full w-full rounded-full object-cover"
													/>
												) : (
													user?.name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />
												)}
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
												<Link
													to="/settings"
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
													onClick={(e) => e.stopPropagation()}
												>
													Settings
												</Link>
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
			
			<main className={styles.mainContent}>
				{activeTab === "dashboard" ? (
					<>
						{/* Stats Section */}
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
							<div className={styles.statsSection}>
								<div className={styles.statCard}>
									<div className={styles.statIcon}>
										<DollarSign className="h-6 w-6" />
							</div>
									<div className={styles.statValue}>${stats.totalEarnings.toFixed(2)}</div>
									<div className={styles.statLabel}>Total Earnings</div>
							</div>
								<div className={styles.statCard}>
									<div className={styles.statIcon}>
										<Briefcase className="h-6 w-6" />
						</div>
									<div className={styles.statValue}>{stats.activeProjects}</div>
									<div className={styles.statLabel}>Active Projects</div>
							</div>
								<div className={styles.statCard}>
									<div className={styles.statIcon}>
										<Award className="h-6 w-6" />
							</div>
									<div className={styles.statValue}>{stats.totalOrders}</div>
									<div className={styles.statLabel}>Completed Orders</div>
						</div>
							</div>
				</div>

						<div className={styles.gridContainer}>
					{/* Left Column - Job Postings */}
							<div className={styles.mainColumn}>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
									className={styles.jobsContainer}
								>
									<div className={styles.jobsHeader}>
										<div className={styles.jobsHeaderContent}>
											<h2 className={styles.jobsTitle}>Recommended Jobs</h2>
											<div className={styles.jobsActions}>
												<button className={styles.filterButton}>
											<Filter className="h-4 w-4" />
										</button>
												<button className={styles.viewAllButton}>View All</button>
									</div>
								</div>
							</div>
							
									<div className={`${styles.jobsList} custom-scrollbar`}>
										<div className={styles.jobsContent}>
									{/* Loading state */}
									{isLoading && jobs.length === 0 && (
												<div className={styles.loadingContainer}>
											<Loader className="h-6 w-6 animate-spin text-gray-500" />
											<span className="ml-2 text-gray-500">Loading jobs...</span>
										</div>
									)}

									{/* Error state */}
									{error && (
												<div className={styles.errorContainer}>
													<p className={styles.errorMessage}>Failed to load jobs</p>
											<button 
												onClick={() => fetchJobs()}
														className={styles.retryButton}
											>
												Try again
											</button>
										</div>
									)}

									{/* Empty state */}
									{!isLoading && !error && jobs.length === 0 && (
												<div className={styles.emptyContainer}>
													<Briefcase className={styles.emptyIcon} />
													<p className={styles.emptyText}>No jobs available at the moment</p>
													<p className={styles.emptySubtext}>Check back later for new opportunities</p>
										</div>
									)}

									{/* Job listings */}
									{jobs.map((job, index) => (
										<motion.div
											key={job._id}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.1 * index }}
													className={styles.jobCard}
												>
													<div className={styles.jobHeader}>
														<div className={styles.jobContent}>
															<h3 className={styles.jobTitle}>{job.title}</h3>
															<div className={styles.jobMeta}>
																<span className={styles.jobMetaItem}>
																	<User className={styles.jobMetaIcon} />
															{job.client?.name || 'Anonymous Client'}
														</span>
																<span className={styles.jobMetaItem}>
																	<DollarSign className={styles.jobMetaIcon} />
															{formatBudget(job.budget, job.budgetType)}
														</span>
																<span className={styles.jobMetaItem}>
																	<Clock className={styles.jobMetaIcon} />
															{job.timeline}
														</span>
													</div>

															<p className={styles.jobDescription}>
														{job.description}
													</p>

															<div className={styles.skillsList}>
														{job.skillsRequired?.map((skill, skillIndex) => (
															<span
																key={skillIndex}
																		className={styles.skillTag}
															>
																{skill}
															</span>
														))}
													</div>

															<div className={styles.jobDetails}>
																<span className={styles.jobDetailTag}>
															{job.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
														</span>
																<span className={styles.jobDetailTag}>
															{job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
														</span>
																<span className={styles.jobDetailTag}>
															{job.location.charAt(0).toUpperCase() + job.location.slice(1)}
														</span>
													</div>

															<div className={styles.jobFooter}>
																<div className={styles.jobStats}>
															<span>{getTimeAgo(job.createdAt)}</span>
															<span>{job.proposalCount || 0} proposals</span>
														</div>
																<div className={styles.jobActions}>
																	<button 
																		onClick={(e) => handleToggleBookmark(e, job._id)}
																		className={`${styles.bookmarkButton} ${isJobBookmarked(job._id) ? styles.active : ''}`}
																		title={isJobBookmarked(job._id) ? "Remove from bookmarks" : "Add to bookmarks"}
																	>
																		<BookmarkIcon className="h-5 w-5" />
																	</button>
																	<button 
																		onClick={() => handleApplyToJob(job)}
																		className={styles.proposalButton}
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
												<div className={styles.loadMoreContainer}>
											<button
												onClick={handleLoadMore}
												disabled={isLoading}
														className={styles.loadMoreButton}
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
							<div className={styles.sideColumn}>
						{/* Active Projects */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
									className={styles.projectsContainer}
								>
									<div className={styles.projectsHeader}>
										<h2 className={styles.projectsTitle}>Active Projects</h2>
										<button className={styles.viewAllButton}>View All</button>
							</div>
							
									<div className={styles.projectsList}>
								{mockActiveProjects.map((project, index) => (
									<motion.div
										key={project.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.1 * index }}
												className={styles.projectCard}
											>
												<h3 className={styles.projectTitle}>{project.title}</h3>
												<p className={styles.projectClient}>{project.client}</p>
												<div className={styles.progressContainer}>
													<span className={styles.progressLabel}>Progress</span>
													<span className={styles.progressValue}>{project.progress}%</span>
										</div>
												<div className={styles.progressBar}>
											<div 
														className={styles.progressFill}
												style={{ width: `${project.progress}%` }}
											></div>
										</div>
												<div className={styles.projectFooter}>
													<span className={styles.projectDueDate}>Due: {new Date(project.deadline).toLocaleDateString()}</span>
													<span className={styles.projectBudget}>${project.budget}</span>
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
									className={styles.activityContainer}
								>
									<div className={styles.activityHeader}>
										<h2 className={styles.activityTitle}>Recent Activity</h2>
										<button className={styles.viewAllButton}>View All</button>
							</div>
							
									<div className={styles.activityList}>
								{mockRecentActivity.map((activity, index) => (
									<motion.div
										key={activity.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.1 * index }}
												className={styles.activityItem}
											>
												<div className={`${styles.activityIcon} ${
													activity.type === 'proposal' ? styles.activityIconProposal :
													activity.type === 'message' ? styles.activityIconMessage :
													activity.type === 'milestone' ? styles.activityIconMilestone :
													styles.activityIconPayment
										}`}>
											{activity.type === 'proposal' && <Briefcase className="h-4 w-4" />}
											{activity.type === 'message' && <MessageSquare className="h-4 w-4" />}
											{activity.type === 'milestone' && <Award className="h-4 w-4" />}
											{activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
										</div>
												<div className={styles.activityContent}>
													<p className={styles.activityMessage}>{activity.message}</p>
													<p className={styles.activityTime}>{activity.time}</p>
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
				) : activeTab === "bookmarks" ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white rounded-xl shadow-sm"
					>
						<BookmarksPage />
					</motion.div>
				) : null}
			</main>

			{/* Add the floating action button for creating posts */}
			<motion.button
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				onClick={() => setIsCreatePostModalOpen(true)}
				className={styles.createButton}
			>
				<Plus className="h-6 w-6" />
			</motion.button>

			{/* Add the CreatePostModal */}
			<CreatePostModal 
				isOpen={isCreatePostModalOpen}
				onClose={() => setIsCreatePostModalOpen(false)}
			/>

			{/* Existing CreateProposalModal */}
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