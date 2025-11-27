import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Page title and metadata configuration
const pageMetadata = {
	'/': {
		title: 'GigPanda - Connect Freelancers with Clients',
		description: 'GigPanda is a modern freelancing platform that connects talented freelancers with clients looking for quality work.'
	},
	'/signup': {
		title: 'Sign Up - GigPanda',
		description: 'Create your GigPanda account and start connecting with clients or freelancers today.'
	},
	'/login': {
		title: 'Login - GigPanda',
		description: 'Login to your GigPanda account to access your dashboard, proposals, and messages.'
	},
	'/verify-email': {
		title: 'Verify Email - GigPanda',
		description: 'Verify your email address to complete your GigPanda account setup.'
	},
	'/forgot-password': {
		title: 'Forgot Password - GigPanda',
		description: 'Reset your GigPanda account password. Enter your email to receive reset instructions.'
	},
	'/reset-password': {
		title: 'Reset Password - GigPanda',
		description: 'Reset your GigPanda account password using the secure token sent to your email.'
	},
	'/dashboard': {
		title: 'Dashboard - GigPanda',
		description: 'Your GigPanda dashboard. View your jobs, proposals, contracts, and messages all in one place.'
	},
	'/client-dashboard': {
		title: 'Client Dashboard - GigPanda',
		description: 'Manage your posted jobs, review proposals, and track contracts from your client dashboard.'
	},
	'/freelancer-dashboard': {
		title: 'Freelancer Dashboard - GigPanda',
		description: 'Browse available jobs, manage your proposals, and track your contracts from your freelancer dashboard.'
	},
	'/profile-setup': {
		title: 'Profile Setup - GigPanda',
		description: 'Complete your GigPanda profile to start connecting with clients or freelancers.'
	},
	'/settings': {
		title: 'Settings - GigPanda',
		description: 'Manage your GigPanda account settings, preferences, and profile information.'
	},
	'/search': {
		title: 'Search - GigPanda',
		description: 'Search for jobs, freelancers, or clients on GigPanda.'
	},
	'/my-proposals': {
		title: 'My Proposals - GigPanda',
		description: 'View and manage all your submitted proposals on GigPanda.'
	},
	'/messages': {
		title: 'Messages - GigPanda',
		description: 'Communicate with clients and freelancers through GigPanda messaging.'
	},
	'/proposals/job': {
		title: 'Job Proposals - GigPanda',
		description: 'Review incoming proposals for your posted job on GigPanda.'
	},
	'/contracts/create': {
		title: 'Create Contract - GigPanda',
		description: 'Create a new contract with a freelancer or client on GigPanda.'
	}
};

/**
 * Custom hook to update page title and meta description based on current route
 */
export const usePageTitle = () => {
	const location = useLocation();

	useEffect(() => {
		// Get base path (without dynamic segments)
		const pathname = location.pathname;
		let metadata = null;

		// Check for exact match first
		if (pageMetadata[pathname]) {
			metadata = pageMetadata[pathname];
		} else {
			// Check for partial matches (for dynamic routes)
			for (const [path, meta] of Object.entries(pageMetadata)) {
				if (pathname.startsWith(path)) {
					metadata = meta;
					break;
				}
			}
		}

		// Default metadata if no match found
		if (!metadata) {
			metadata = {
				title: 'GigPanda - Connect Freelancers with Clients',
				description: 'GigPanda is a modern freelancing platform that connects talented freelancers with clients looking for quality work.'
			};
		}

		// Update document title
		document.title = metadata.title;

		// Update meta description
		let metaDescription = document.querySelector('meta[name="description"]');
		if (!metaDescription) {
			metaDescription = document.createElement('meta');
			metaDescription.setAttribute('name', 'description');
			document.head.appendChild(metaDescription);
		}
		metaDescription.setAttribute('content', metadata.description);

		// Update Open Graph description
		let ogDescription = document.querySelector('meta[property="og:description"]');
		if (!ogDescription) {
			ogDescription = document.createElement('meta');
			ogDescription.setAttribute('property', 'og:description');
			document.head.appendChild(ogDescription);
		}
		ogDescription.setAttribute('content', metadata.description);

		// Update Open Graph title
		let ogTitle = document.querySelector('meta[property="og:title"]');
		if (!ogTitle) {
			ogTitle = document.createElement('meta');
			ogTitle.setAttribute('property', 'og:title');
			document.head.appendChild(ogTitle);
		}
		ogTitle.setAttribute('content', metadata.title);

		// Update Twitter description
		let twitterDescription = document.querySelector('meta[property="twitter:description"]');
		if (!twitterDescription) {
			twitterDescription = document.createElement('meta');
			twitterDescription.setAttribute('property', 'twitter:description');
			document.head.appendChild(twitterDescription);
		}
		twitterDescription.setAttribute('content', metadata.description);

		// Update Twitter title
		let twitterTitle = document.querySelector('meta[property="twitter:title"]');
		if (!twitterTitle) {
			twitterTitle = document.createElement('meta');
			twitterTitle.setAttribute('property', 'twitter:title');
			document.head.appendChild(twitterTitle);
		}
		twitterTitle.setAttribute('content', metadata.title);
	}, [location.pathname]);
};

