import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/messages" : "/api/messages";

// Configure axios to send credentials
axios.defaults.withCredentials = true;

export const useMessageStore = create((set, get) => ({
    conversations: [],
    currentConversation: {
        user: null,
        messages: [],
        pagination: {
            current: 1,
            pages: 1,
            total: 0
        }
    },
    unreadCount: 0,
    isLoading: false,
    error: null,
    eventSource: null,

    // Initialize SSE connection
    initializeSSE: (conversationId) => {
        // Close existing connection if any
        get().cleanupSSE();

        const userId = useAuthStore.getState().user._id;
        let retryCount = 0;
        const maxRetries = 5;
        const baseDelay = 1000; // Start with 1 second delay

        const connect = () => {
            const eventSource = new EventSource(`${API_URL}/stream/${userId}`);
            let reconnectTimeout = null;

            eventSource.onmessage = (event) => {
                try {
                    // Reset retry count on successful message
                    retryCount = 0;
                    
                    const data = JSON.parse(event.data);
                    
                    // Handle different event types
                    if (data.type === 'message') {
                        const message = data.message;
                        
                        // Only process messages for the current conversation
                        if (
                            (message.sender._id === conversationId || message.receiver._id === conversationId) &&
                            !get().currentConversation.messages.some(msg => msg._id === message._id)
                        ) {
                            // Update conversations list with the new message
                            set(state => ({
                                conversations: state.conversations.map(conv => 
                                    (conv._id === message.sender._id || conv._id === message.receiver._id) ? {
                                        ...conv,
                                        lastMessage: message,
                                        unreadCount: message.sender._id !== userId ? (conv.unreadCount || 0) + 1 : conv.unreadCount
                                    } : conv
                                ),
                                currentConversation: {
                                    ...state.currentConversation,
                                    messages: [...state.currentConversation.messages, message]
                                }
                            }));
                        }
                    } else if (data.type === 'read_receipt') {
                        // Handle read receipts
                        set(state => ({
                            currentConversation: {
                                ...state.currentConversation,
                                messages: state.currentConversation.messages.map(msg => 
                                    msg.sender._id === userId && data.messageIds.includes(msg._id) 
                                        ? { ...msg, isRead: true }
                                        : msg
                                )
                            }
                        }));
                    }
                } catch (err) {
                    console.error('Error processing SSE message:', err);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE Error:', error);
                eventSource.close();
                
                // Clear any existing reconnection timeout
                if (reconnectTimeout) {
                    clearTimeout(reconnectTimeout);
                }

                // Implement exponential backoff for retries
                if (retryCount < maxRetries) {
                    const delay = Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Max 30 second delay
                    retryCount++;
                    
                    reconnectTimeout = setTimeout(() => {
                        if (get().eventSource === eventSource) {
                            connect();
                        }
                    }, delay);
                } else {
                    console.error('Max retry attempts reached');
                    toast.error('Connection lost. Please refresh the page.');
                }
            };

            eventSource.onopen = () => {
                console.log('SSE connection established');
                // Reset retry count on successful connection
                retryCount = 0;
            };

            set({ eventSource });
        };

        connect();
    },

    // Cleanup SSE connection
    cleanupSSE: () => {
        const eventSource = get().eventSource;
        if (eventSource) {
            eventSource.close();
            set({ eventSource: null });
        }
    },

    // Append a new message to the current conversation
    appendMessage: (message) => {
        set(state => ({
            currentConversation: {
                ...state.currentConversation,
                messages: [...state.currentConversation.messages, message]
            }
        }));
    },

    // Update a message in the current conversation
    updateMessage: (tempId, updatedMessage) => {
        set(state => ({
            currentConversation: {
                ...state.currentConversation,
                messages: state.currentConversation.messages.map(msg => 
                    msg._id === tempId ? updatedMessage : msg
                )
            }
        }));
    },

    // Create or get existing conversation
    createOrGetConversation: async (receiverId, jobId = null, proposalId = null) => {
        set({ isLoading: true, error: null });
        try {
            // First try to get existing conversation
            const response = await axios.get(`${API_URL}/conversation/${receiverId}`);
            
            // If no messages exist, send an initial message to create the conversation
            if (!response.data.data.length) {
                await axios.post(API_URL, {
                    receiverId,
                    content: "Started a conversation",
                    jobId,
                    proposalId
                });
            }

            // Get the other user's info from the response
            const otherUser = response.data.data[0]?.sender._id === receiverId 
                ? response.data.data[0]?.sender 
                : response.data.data[0]?.receiver;

            // Return the conversation info
            return {
                _id: receiverId,
                jobId,
                proposalId,
                name: otherUser?.name || "User",
                profile: otherUser?.profile
            };
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error creating conversation",
                isLoading: false 
            });
            toast.error(error.response?.data?.message || "Error creating conversation");
            throw error;
        }
    },

    // Send a new message
    sendMessage: async (receiverId, content, jobId = null, proposalId = null) => {
        const tempId = Date.now().toString();
        const currentUser = useAuthStore.getState().user;
        
        try {
            // Add pending message to the UI immediately
            const pendingMessage = {
                _id: tempId,
                content,
                sender: { _id: currentUser._id, name: currentUser.name },
                receiver: { _id: receiverId },
                createdAt: new Date().toISOString(),
                isPending: true
            };
            
            get().appendMessage(pendingMessage);

            // Send the message to the server
            const response = await axios.post(API_URL, {
                receiverId,
                content,
                jobId,
                proposalId
            });

            // Update the temporary message with the server response
            get().updateMessage(tempId, {
                ...response.data.data,
                isRead: false
            });

            return response.data.data;
        } catch (error) {
            // Remove the pending message on error
            set(state => ({
                currentConversation: {
                    ...state.currentConversation,
                    messages: state.currentConversation.messages.filter(msg => msg._id !== tempId)
                }
            }));
            toast.error(error.response?.data?.message || "Error sending message");
            throw error;
        }
    },

    // Get conversation messages
    getConversation: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/conversation/${userId}`);
            
            // Get the other user's info
            const otherUser = response.data.data[0]?.sender._id === userId 
                ? response.data.data[0]?.sender 
                : response.data.data[0]?.receiver;

            // Update messages with read status
            const messages = response.data.data.map(message => ({
                ...message,
                isRead: message.isRead || message.sender._id === userId
            }));

            // Only update if there are new messages or read status changes
            set(state => {
                // Check if we have new messages
                const currentMessageIds = new Set(state.currentConversation.messages.map(m => m._id));
                const hasNewMessages = messages.some(m => !currentMessageIds.has(m._id));

                // Check if read status has changed
                const readStatusChanged = messages.some(newMsg => {
                    const existingMsg = state.currentConversation.messages.find(m => m._id === newMsg._id);
                    return existingMsg && existingMsg.isRead !== newMsg.isRead;
                });

                // Only update state if necessary
                if (hasNewMessages || readStatusChanged) {
                    // Update the unread count in the conversations list
                    const updatedConversations = state.conversations.map(conv => {
                        if (conv._id === userId) {
                            return {
                                ...conv,
                                unreadCount: 0 // Reset unread count for this conversation
                            };
                        }
                        return conv;
                    });

                    return {
                        currentConversation: {
                            user: otherUser,
                            messages,
                            pagination: response.data.pagination
                        },
                        conversations: updatedConversations,
                        isLoading: false
                    };
                }

                return { isLoading: false };
            });

            return response.data.data;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching conversation",
                isLoading: false 
            });
            throw error;
        }
    },

    // Get all conversations
    getConversations: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/conversations`);
            set({ 
                conversations: response.data.data.map(conv => ({
                    _id: conv._id._id,
                    name: conv._id.name,
                    profile: conv._id.profile,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount
                })),
                isLoading: false 
            });
            return response.data.data;
        } catch (error) {
            set({ 
                error: error.response?.data?.message || "Error fetching conversations",
                isLoading: false 
            });
            throw error;
        }
    },

    // Get unread message count
    getUnreadCount: async () => {
        try {
            const response = await axios.get(`${API_URL}/unread`);
            set({ unreadCount: response.data.data.count });
            return response.data.data.count;
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    },

    // Clear current conversation
    clearCurrentConversation: () => {
        set({
            currentConversation: {
                user: null,
                messages: [],
                pagination: {
                    current: 1,
                    pages: 1,
                    total: 0
                }
            }
        });
    },

    // Update unread count (used when receiving new messages)
    updateUnreadCount: (count) => {
        set({ unreadCount: count });
    }
})); 