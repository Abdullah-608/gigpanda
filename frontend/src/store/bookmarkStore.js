import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URLS } from "../config/api.js";

export const useBookmarkStore = create((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,
  bookmarkedJobIds: new Set(), // For quick lookup

  // Fetch all bookmarks
  fetchBookmarks: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(API_URLS.bookmarks);
      
      // Create a set of bookmarked job IDs for quick lookups
      const bookmarkedIds = new Set(response.data.data.map(job => job._id));
      
      set({ 
        bookmarks: response.data.data,
        bookmarkedJobIds: bookmarkedIds,
        isLoading: false 
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch bookmarks', isLoading: false });
      return [];
    }
  },

  // Check if a job is bookmarked
  isJobBookmarked: (jobId) => {
    return get().bookmarkedJobIds.has(jobId);
  },

  // Add a bookmark
  addBookmark: async (jobId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(API_URLS.bookmarks, { job_id: jobId });
      
      // Update the bookmarked jobs set
      const newBookmarkedIds = new Set(get().bookmarkedJobIds);
      newBookmarkedIds.add(jobId);
      
      set({ bookmarkedJobIds: newBookmarkedIds, isLoading: false });
      toast.success('Job bookmarked successfully');
      return response.data;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      set({ error: error.response?.data?.message || 'Failed to bookmark job', isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to bookmark job');
      return null;
    }
  },

  // Remove a bookmark
  removeBookmark: async (jobId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.delete(`${API_URLS.bookmarks}/${jobId}`);
      
      // Update the bookmarked jobs set
      const newBookmarkedIds = new Set(get().bookmarkedJobIds);
      newBookmarkedIds.delete(jobId);
      
      // Remove the job from bookmarks array
      const updatedBookmarks = get().bookmarks.filter(job => job._id !== jobId);
      
      set({ 
        bookmarks: updatedBookmarks,
        bookmarkedJobIds: newBookmarkedIds, 
        isLoading: false 
      });
      toast.success('Bookmark removed successfully');
      return response.data;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      set({ error: error.response?.data?.message || 'Failed to remove bookmark', isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to remove bookmark');
      return null;
    }
  },

  // Toggle bookmark
  toggleBookmark: async (jobId) => {
    const isBookmarked = get().bookmarkedJobIds.has(jobId);
    if (isBookmarked) {
      return await get().removeBookmark(jobId);
    } else {
      return await get().addBookmark(jobId);
    }
  }
}));