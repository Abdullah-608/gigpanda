// API Configuration
const config = {
    development: {
        baseURL: import.meta.env.VITE_DEV_API_BASE_URL || 'http://localhost:5000/api',
        wsURL: import.meta.env.VITE_DEV_WS_URL || 'ws://localhost:5000',
        backendURL: import.meta.env.VITE_DEV_BACKEND_URL || 'http://localhost:5000',
    },
    production: {
        baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
        wsURL: import.meta.env.VITE_WS_URL || window.location.origin.replace(/^http/, 'ws'),
        backendURL: import.meta.env.VITE_BACKEND_URL || window.location.origin,
    }
};

const mode = import.meta.env.MODE || 'development';

export const API_CONFIG = config[mode];

// Helper function to get full API URL for a specific service
export const getServiceURL = (service) => {
    return `${API_CONFIG.baseURL}/${service}`;
};

// Export commonly used service URLs
export const API_URLS = {
    auth: getServiceURL('auth'),
    users: getServiceURL('users'),
    jobs: getServiceURL('jobs'),
    proposals: getServiceURL('proposals'),
    contracts: getServiceURL('contracts'),
    messages: getServiceURL('messages'),
    notifications: getServiceURL('notifications'),
    posts: getServiceURL('posts'),
    bookmarks: getServiceURL('bookmarks'),
    gemini: getServiceURL('gemini'),
}; 