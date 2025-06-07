import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/jobs" : "/api/jobs";

axios.defaults.withCredentials = true;

export const useJobStore = create((set, get) => ({
    jobs: [],
    currentJob: null,
    myJobs: [],
    myApplications: [],
    hotJobs: [],
    isLoading: false,
    isLoadingHotJobs: false,
    error: null,
    isCreatingJob: false,
    isApplying: false,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNextPage: false,
        hasPrevPage: false
    },
    myJobsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNextPage: false,
        hasPrevPage: false
    },
    applicationsPagination: {
        currentPage: 1,
        totalPages: 1,
        totalApplications: 0,
        hasNextPage: false,
        hasPrevPage: false
    },

    // Create a new job posting (for clients)
    createJob: async (jobData) => {
        set({ isCreatingJob: true, error: null });
        try {
            const response = await axios.post(API_URL, jobData);
            
            if (response.data.success) {
                // Add the new job to the beginning of myJobs array
                set((state) => ({
                    myJobs: [response.data.job, ...state.myJobs],
                    isCreatingJob: false,
                    error: null
                }));
                return response.data;
            }
        } catch (error) {
            console.error('Error creating job:', error);
            const errorMessage = error.response?.data?.message || "Failed to create job";
            set({ error: errorMessage, isCreatingJob: false });
            throw new Error(errorMessage);
        }
    },

    // Fetch all jobs with filtering (for freelancers)
    fetchJobs: async (page = 1, limit = 10, filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...filters
            });

            const response = await axios.get(`${API_URL}?${params}`);
            
            if (response.data.success) {
                set({
                    jobs: page === 1 ? response.data.jobs : [...get().jobs, ...response.data.jobs],
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            const errorMessage = error.response?.data?.message || "Failed to fetch jobs";
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    // Get a single job by ID
    fetchJobById: async (jobId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/${jobId}`);
            
            if (response.data.success) {
                set({
                    currentJob: response.data.job,
                    isLoading: false,
                    error: null
                });
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching job:', error);
            const errorMessage = error.response?.data?.message || "Failed to fetch job";
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    // Apply to a job (for freelancers)
    applyToJob: async (jobId, applicationData) => {
        set({ isApplying: true, error: null });
        try {
            const response = await axios.post(`/api/proposals/${jobId}`, {
                coverLetter: applicationData.proposalText,
                bidAmount: {
                    amount: applicationData.proposedBudget,
                    currency: "USD"
                },
                estimatedDuration: applicationData.estimatedDuration
            });
            
            if (response.data.success) {
                set({ isApplying: false, error: null });
                return response.data;
            }
        } catch (error) {
            console.error('Error applying to job:', error);
            const errorMessage = error.response?.data?.message || "Failed to apply to job";
            set({ error: errorMessage, isApplying: false });
            throw new Error(errorMessage);
        }
    },

    // Fetch my jobs (for clients)
    fetchMyJobs: async (page = 1, limit = 10, status = 'all') => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            
            if (status && status !== 'all') {
                params.append('status', status);
            }

            const response = await axios.get(`${API_URL}/my/jobs?${params}`);
            
            if (response.data.success) {
                set({
                    myJobs: page === 1 ? response.data.jobs : [...get().myJobs, ...response.data.jobs],
                    myJobsPagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching my jobs:', error);
            const errorMessage = error.response?.data?.message || "Failed to fetch your jobs";
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    // Fetch my applications (for freelancers)
    fetchMyApplications: async (page = 1, limit = 10, status = 'all') => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            
            if (status && status !== 'all') {
                params.append('status', status);
            }

            const response = await axios.get(`${API_URL}/my/applications?${params}`);
            
            if (response.data.success) {
                set({
                    myApplications: page === 1 ? response.data.applications : [...get().myApplications, ...response.data.applications],
                    applicationsPagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching my applications:', error);
            const errorMessage = error.response?.data?.message || "Failed to fetch your applications";
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    // Update job status (for clients)
    updateJobStatus: async (jobId, statusData) => {
        try {
            const response = await axios.patch(`${API_URL}/${jobId}/status`, statusData);
            
            if (response.data.success) {
                // Update the job in myJobs array
                set((state) => ({
                    myJobs: state.myJobs.map(job => 
                        job._id === jobId 
                            ? { ...job, ...response.data.job }
                            : job
                    ),
                    currentJob: state.currentJob && state.currentJob._id === jobId 
                        ? { ...state.currentJob, ...response.data.job }
                        : state.currentJob
                }));
                return response.data;
            }
        } catch (error) {
            console.error('Error updating job status:', error);
            const errorMessage = error.response?.data?.message || "Failed to update job status";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    // Load more jobs (pagination)
    loadMoreJobs: async (filters = {}) => {
        const { pagination } = get();
        if (pagination.hasNextPage) {
            return get().fetchJobs(pagination.currentPage + 1, 10, filters);
        }
    },

    // Load more my jobs
    loadMoreMyJobs: async (status = 'all') => {
        const { myJobsPagination } = get();
        if (myJobsPagination.hasNextPage) {
            return get().fetchMyJobs(myJobsPagination.currentPage + 1, 10, status);
        }
    },

    // Load more applications
    loadMoreApplications: async (status = 'all') => {
        const { applicationsPagination } = get();
        if (applicationsPagination.hasNextPage) {
            return get().fetchMyApplications(applicationsPagination.currentPage + 1, 10, status);
        }
    },

    // Search jobs
    searchJobs: async (searchTerm, filters = {}) => {
        return get().fetchJobs(1, 10, { ...filters, search: searchTerm });
    },

    // Filter jobs
    filterJobs: async (filters) => {
        return get().fetchJobs(1, 10, filters);
    },

    // Clear jobs
    clearJobs: () => {
        set({
            jobs: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalJobs: 0,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    // Clear my jobs
    clearMyJobs: () => {
        set({
            myJobs: [],
            myJobsPagination: {
                currentPage: 1,
                totalPages: 1,
                totalJobs: 0,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    // Clear applications
    clearApplications: () => {
        set({
            myApplications: [],
            applicationsPagination: {
                currentPage: 1,
                totalPages: 1,
                totalApplications: 0,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    // Clear current job
    clearCurrentJob: () => {
        set({ currentJob: null });
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },

    // Fetch hot/trending jobs
    fetchHotJobs: async (limit = 6) => {
        set({ isLoadingHotJobs: true, error: null });
        try {
            const params = new URLSearchParams({
                limit: limit.toString()
            });

            const response = await axios.get(`${API_URL}/hot?${params}`);
            
            if (response.data.success) {
                set({
                    hotJobs: response.data.jobs,
                    isLoadingHotJobs: false,
                    error: null
                });
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching hot jobs:', error);
            const errorMessage = error.response?.data?.message || "Failed to fetch hot jobs";
            set({ error: errorMessage, isLoadingHotJobs: false });
            throw new Error(errorMessage);
        }
    },

    // Delete a job (for clients)
    deleteJob: async (jobId) => {
        try {
            const response = await axios.delete(`${API_URL}/${jobId}`);
            
            if (response.data.success) {
                // Remove the job from myJobs array
                set((state) => ({
                    myJobs: state.myJobs.filter(job => job._id !== jobId)
                }));
                return response.data;
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            const errorMessage = error.response?.data?.message || "Failed to delete job";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    }
})); 