import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/posts" : "/api/posts";

axios.defaults.withCredentials = true;

export const usePostStore = create((set, get) => ({
    posts: [],
    currentPost: null,
    isLoading: false,
    error: null,
    isCreatingPost: false,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        hasNextPage: false,
        hasPrevPage: false
    },

    // Create a new post
    createPost: async (postData) => {
        set({ isCreatingPost: true, error: null });
        try {
            const response = await axios.post(API_URL, postData);
            
            if (response.data.success) {
                // Add the new post to the beginning of the posts array
                set((state) => ({
                    posts: [response.data.post, ...state.posts],
                    isCreatingPost: false,
                    error: null
                }));
                return response.data;
            }
        } catch (error) {
            console.error('Error creating post:', error);
            const errorMessage = error.response?.data?.message || "Failed to create post";
            set({ error: errorMessage, isCreatingPost: false });
            throw new Error(errorMessage);
        }
    },

    // Fetch posts with pagination and filtering
    fetchPosts: async (page = 1, limit = 10, type = 'all') => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            
            if (type && type !== 'all') {
                params.append('type', type);
            }

            const response = await axios.get(`${API_URL}?${params}`);
            
            if (response.data.success) {
                set({
                    posts: page === 1 ? response.data.posts : [...get().posts, ...response.data.posts],
                    pagination: response.data.pagination,
                    isLoading: false,
                    error: null
                });
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            const errorMessage = error.response?.data?.message || "Failed to fetch posts";
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    // Toggle like on a post
    toggleLike: async (postId) => {
        try {
            const response = await axios.post(`${API_URL}/${postId}/like`);
            
            if (response.data.success) {
                // Update the post in the posts array
                set((state) => ({
                    posts: state.posts.map(post => 
                        post.id === postId 
                            ? { 
                                ...post, 
                                likeCount: response.data.likeCount,
                                isLiked: response.data.isLiked 
                              }
                            : post
                    )
                }));
            }
            return response.data;
        } catch (error) {
            console.error('Error toggling like:', error);
            const errorMessage = error.response?.data?.message || "Failed to toggle like";
            throw new Error(errorMessage);
        }
    },

    // Add a comment to a post
    addComment: async (postId, content) => {
        try {
            const response = await axios.post(`${API_URL}/${postId}/comment`, { content });
            
            if (response.data.success) {
                // Update the post in the posts array
                set((state) => ({
                    posts: state.posts.map(post => 
                        post.id === postId 
                            ? { 
                                ...post, 
                                commentCount: response.data.commentCount,
                                comments: post.comments.length < 3 
                                    ? [...post.comments, response.data.comment]
                                    : [response.data.comment, ...post.comments.slice(0, 2)]
                              }
                            : post
                    )
                }));
            }
            return response.data;
        } catch (error) {
            console.error('Error adding comment:', error);
            const errorMessage = error.response?.data?.message || "Failed to add comment";
            throw new Error(errorMessage);
        }
    },

    // Load more posts (pagination)
    loadMorePosts: async () => {
        const { pagination } = get();
        if (pagination.hasNextPage) {
            return get().fetchPosts(pagination.currentPage + 1, 10, 'all');
        }
    },

    // Refresh posts (reload from beginning)
    refreshPosts: async () => {
        return get().fetchPosts(1, 10, 'all');
    },

    // Filter posts by type
    filterPostsByType: async (type) => {
        return get().fetchPosts(1, 10, type);
    },

    // Clear posts
    clearPosts: () => {
        set({
            posts: [],
            currentPost: null,
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalPosts: 0,
                hasNextPage: false,
                hasPrevPage: false
            }
        });
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    }
})); 