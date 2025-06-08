// API Configuration
const config = {
    development: {
        baseURL: 'http://localhost:5000/api',
        wsURL: 'ws://localhost:5000',
    },
    production: {
        // These will be replaced with your actual production URLs
        baseURL: '/api', // This will be relative to your domain
        wsURL: window.location.origin.replace(/^http/, 'ws'),
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
}; 