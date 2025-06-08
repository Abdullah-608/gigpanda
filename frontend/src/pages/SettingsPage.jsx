import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { Navigate } from 'react-router-dom';
import { User, Bell, Shield, Save, Camera, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const FreelancerProfile = ({ user, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.profile?.bio || '',
        country: user?.profile?.country || '',
        languages: user?.profile?.languages || ['English'],
        skills: user?.profile?.skills || [],
        education: user?.profile?.education || [],
        certifications: user?.profile?.certifications || [],
        pictureUrl: user?.profile?.pictureUrl || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            personal: {
                name: formData.name,
                bio: formData.bio,
                country: formData.country,
                languages: formData.languages,
                pictureUrl: formData.pictureUrl
            },
            professional: {
                skills: formData.skills,
                education: formData.education,
                certifications: formData.certifications
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, pictureUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex justify-center">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                            src={formData.pictureUrl || '/default-avatar.png'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <label className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full text-white cursor-pointer hover:bg-green-700 transition-colors">
                        <Camera className="h-4 w-4" />
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.skills.join(', ')}
                            onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Languages (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.languages.join(', ')}
                            onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value.split(',').map(s => s.trim()) }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const ClientProfile = ({ user, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.profile?.bio || '',
        country: user?.profile?.country || '',
        languages: user?.profile?.languages || ['English'],
        companyName: user?.profile?.companyName || '',
        companyInfo: user?.profile?.companyInfo || '',
        companyLink: user?.profile?.companyLink || '',
        pastProjects: user?.profile?.pastProjects || [],
        pictureUrl: user?.profile?.pictureUrl || ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            personal: {
                name: formData.name,
                bio: formData.bio,
                country: formData.country,
                languages: formData.languages,
                pictureUrl: formData.pictureUrl
            },
            professional: {
                companyName: formData.companyName,
                companyInfo: formData.companyInfo,
                companyLink: formData.companyLink,
                pastProjects: formData.pastProjects
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, pictureUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex justify-center">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <img
                            src={formData.pictureUrl || '/default-avatar.png'}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <label className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full text-white cursor-pointer hover:bg-green-700 transition-colors">
                        <Camera className="h-4 w-4" />
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Company Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Info</label>
                        <textarea
                            value={formData.companyInfo}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyInfo: e.target.value }))}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Website</label>
                        <input
                            type="url"
                            value={formData.companyLink}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyLink: e.target.value }))}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 text-green-600 animate-spin" />
        <p className="mt-2 text-sm text-gray-500">Loading your settings...</p>
    </div>
);

const SettingsPage = () => {
    const { user } = useAuthStore();
    const { updateProfile, isLoading: isUpdating, fetchProfile } = useUserStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoadingProfile(true);
                const data = await fetchProfile();
                setProfileData(data);
            } catch (error) {
                toast.error('Failed to load profile data');
            } finally {
                setIsLoadingProfile(false);
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user, fetchProfile]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleSave = async (data) => {
        try {
            await updateProfile({
                ...data,
                userType: user.role
            });
            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to update settings');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <div className="px-6 py-4">
                            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        </div>
                        <div className="px-6">
                            <nav className="-mb-px flex space-x-6">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`${
                                        activeTab === 'profile'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`${
                                        activeTab === 'notifications'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                >
                                    <Bell className="h-4 w-4 mr-2" />
                                    Notifications
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`${
                                        activeTab === 'security'
                                            ? 'border-green-500 text-green-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Security
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {isLoadingProfile ? (
                                    <LoadingSpinner />
                                ) : (
                                    user.role === 'freelancer' ? (
                                        <FreelancerProfile user={profileData || user} onSave={handleSave} isLoading={isUpdating} />
                                    ) : (
                                        <ClientProfile user={profileData || user} onSave={handleSave} isLoading={isUpdating} />
                                    )
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                                            <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                                        </div>
                                        <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 bg-green-600">
                                            <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                        </div>
                                        <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 bg-gray-200">
                                            <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;