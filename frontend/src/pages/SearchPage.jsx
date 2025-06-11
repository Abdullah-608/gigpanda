import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Search, 
    Filter, 
    X, 
    DollarSign, 
    Clock, 
    User, 
    Briefcase, 
    MapPin,
    BookmarkIcon,
    ChevronDown,
    Loader,
    SlidersHorizontal
} from "lucide-react";
import { useJobStore } from "../store/jobStore";
import { useBookmarkStore } from "../store/bookmarkStore";
import { useAuthStore } from "../store/authStore";

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    // Get search query from URL
    const initialQuery = searchParams.get('s') || '';
    
    // Search and filter states
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        budgetType: '',
        budgetMin: '',
        budgetMax: '',
        experienceLevel: '',
        timeline: '',
        location: '',
        sortBy: 'newest'
    });
    
    // Job store
    const { 
        jobs, 
        isLoading, 
        error, 
        pagination, 
        searchJobs, 
        loadMoreJobs,
        clearJobs 
    } = useJobStore();
    
    // Bookmark store
    const { isJobBookmarked, toggleBookmark } = useBookmarkStore();
    
    // Filter options based on job model
    const filterOptions = {
        categories: [
            { value: 'web-development', label: 'Web Development' },
            { value: 'mobile-development', label: 'Mobile Development' },
            { value: 'ui-ux-design', label: 'UI/UX Design' },
            { value: 'graphic-design', label: 'Graphic Design' },
            { value: 'content-writing', label: 'Content Writing' },
            { value: 'digital-marketing', label: 'Digital Marketing' },
            { value: 'data-analysis', label: 'Data Analysis' },
            { value: 'video-editing', label: 'Video Editing' },
            { value: 'translation', label: 'Translation' },
            { value: 'virtual-assistant', label: 'Virtual Assistant' },
            { value: 'other', label: 'Other' }
        ],
        budgetTypes: [
            { value: 'fixed', label: 'Fixed Price' },
            { value: 'hourly', label: 'Hourly Rate' }
        ],
        experienceLevels: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'expert', label: 'Expert' }
        ],
        timelines: [
            { value: 'urgent', label: 'Urgent (Less than 1 week)' },
            { value: '1-week', label: '1 Week' },
            { value: '2-weeks', label: '2 Weeks' },
            { value: '1-month', label: '1 Month' },
            { value: '2-months', label: '2 Months' },
            { value: '3+ months', label: '3+ Months' }
        ],
        locations: [
            { value: 'remote', label: 'Remote' },
            { value: 'local', label: 'Local' },
            { value: 'hybrid', label: 'Hybrid' }
        ],
        sortOptions: [
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'budget-high', label: 'Highest Budget' },
            { value: 'budget-low', label: 'Lowest Budget' },
            { value: 'deadline', label: 'Deadline' }
        ]
    };

    // Search function
    const performSearch = useCallback(async (query = searchQuery, filterParams = filters, page = 1) => {
        try {
            const searchParams = {
                query: query.trim(),
                ...filterParams,
                page,
                limit: 10
            };
            
            // Remove empty filter values
            Object.keys(searchParams).forEach(key => {
                if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
                    delete searchParams[key];
                }
            });
            
            if (page === 1) {
                clearJobs(); // Clear existing jobs for new search
            }
            
            await searchJobs(searchParams);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }, [searchQuery, filters, searchJobs, clearJobs]);

    // Initial search on component mount
    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery, filters, 1);
        }
    }, [initialQuery]);

    // Handle search input submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Update URL
            setSearchParams({ s: searchQuery.trim() });
            // Perform search
            performSearch(searchQuery.trim(), filters, 1);
        }
    };

    // Handle filter changes
    const handleFilterChange = (filterKey, value) => {
        const newFilters = { ...filters, [filterKey]: value };
        setFilters(newFilters);
        
        // Auto-search when filters change
        if (searchQuery.trim()) {
            performSearch(searchQuery, newFilters, 1);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        const resetFilters = {
            category: '',
            budgetType: '',
            budgetMin: '',
            budgetMax: '',
            experienceLevel: '',
            timeline: '',
            location: '',
            sortBy: 'newest'
        };
        setFilters(resetFilters);
        if (searchQuery.trim()) {
            performSearch(searchQuery, resetFilters, 1);
        }
    };

    // Load more results
    const handleLoadMore = () => {
        if (pagination.hasNextPage && !isLoading) {
            performSearch(searchQuery, filters, pagination.currentPage + 1);
        }
    };

    // Handle bookmark toggle
    const handleToggleBookmark = async (e, jobId) => {
        e.stopPropagation();
        if (user) {
            await toggleBookmark(jobId);
        }
    };

    // Format budget display
    const formatBudget = (budget, budgetType) => {
        if (budgetType === 'hourly') {
            return `$${budget.min} - $${budget.max}/hr`;
        } else {
            return `$${budget.min} - $${budget.max}`;
        }
    };

    // Get time ago
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

    // Handle job click
    const handleJobClick = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    // Count active filters
    const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                            >
                                ←
                            </button>
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold text-gray-800">GigPanda</span>
                                <span className="ml-2 text-2xl">🐼</span>
                            </div>
                            <div className="ml-8">
                                <h1 className="text-lg font-semibold text-gray-900">Job Search</h1>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </button>
                            {user && (
                                <div className="flex items-center space-x-2">
                                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
                                        {user?.profile?.pictureUrl ? (
                                            <img 
                                                src={user.profile.pictureUrl} 
                                                alt={user.name} 
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            user?.name?.charAt(0)?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-700">{user?.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 max-w-2xl">
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for jobs..."
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition-colors flex items-center"
                                    >
                                        <Search className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                        
                        <button
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <SlidersHorizontal className="h-5 w-5 mr-2" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                    
                    {/* Search Results Summary */}
                    {searchQuery && (
                        <div className="mt-4">
                            <p className="text-gray-600">
                                {isLoading ? (
                                    'Searching...'
                                ) : (
                                    <>
                                        {pagination.total || 0} jobs found for "{searchQuery}"
                                    </>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <div className={`lg:w-80 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">All Categories</option>
                                        {filterOptions.categories.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Budget Type Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Type
                                    </label>
                                    <select
                                        value={filters.budgetType}
                                        onChange={(e) => handleFilterChange('budgetType', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Any Budget Type</option>
                                        {filterOptions.budgetTypes.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Budget Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Budget Range
                                    </label>
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.budgetMin}
                                            onChange={(e) => handleFilterChange('budgetMin', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.budgetMax}
                                            onChange={(e) => handleFilterChange('budgetMax', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Experience Level Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Experience Level
                                    </label>
                                    <select
                                        value={filters.experienceLevel}
                                        onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Any Level</option>
                                        {filterOptions.experienceLevels.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Timeline Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timeline
                                    </label>
                                    <select
                                        value={filters.timeline}
                                        onChange={(e) => handleFilterChange('timeline', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Any Timeline</option>
                                        {filterOptions.timelines.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Location Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <select
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Any Location</option>
                                        {filterOptions.locations.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        {filterOptions.sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Results */}
                    <div className="flex-1">
                        {/* Loading State */}
                        {isLoading && jobs.length === 0 && (
                            <div className="flex items-center justify-center py-12">
                                <Loader className="h-8 w-8 animate-spin text-green-600 mr-3" />
                                <span className="text-gray-600">Searching for jobs...</span>
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <p className="text-red-600 mb-2">Failed to search jobs</p>
                                <button 
                                    onClick={() => performSearch()}
                                    className="text-red-800 hover:text-red-900 underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && jobs.length === 0 && searchQuery && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your search terms or filters to find more results.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="text-green-600 hover:text-green-800 underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {/* Job Results */}
                        {jobs.length > 0 && (
                            <div className="space-y-4">
                                {jobs.map((job, index) => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => handleJobClick(job._id)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-4">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <div className="text-lg font-bold text-green-600">
                                                    {formatBudget(job.budget, job.budgetType)}
                                                </div>
                                                {user && (
                                                    <button
                                                        onClick={(e) => handleToggleBookmark(e, job._id)}
                                                        className={`p-2 rounded-full transition-colors ${
                                                            isJobBookmarked(job._id)
                                                                ? 'text-green-600 bg-green-50'
                                                                : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                    >
                                                        <BookmarkIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                            <span className="flex items-center">
                                                <User className="h-4 w-4 mr-1" />
                                                {job.client?.name || 'Anonymous'}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {job.timeline}
                                            </span>
                                            <span className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {job.location}
                                            </span>
                                        </div>

                                        <p className="text-gray-700 mb-4 line-clamp-3">
                                            {job.description}
                                        </p>

                                        {job.skillsRequired && job.skillsRequired.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {job.skillsRequired.slice(0, 5).map((skill, skillIndex) => (
                                                    <span
                                                        key={skillIndex}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skillsRequired.length > 5 && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        +{job.skillsRequired.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>{getTimeAgo(job.createdAt)}</span>
                                                <span>{job.proposalCount || 0} proposals</span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                    {job.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                    {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Load More Button */}
                                {pagination.hasNextPage && (
                                    <div className="flex justify-center mt-8">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoading}
                                            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader className="h-4 w-4 animate-spin mr-2" />
                                                    Loading...
                                                </>
                                            ) : (
                                                'Load More Jobs'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage; 