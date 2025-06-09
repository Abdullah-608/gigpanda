import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { Navigate } from 'react-router-dom';
import { User, Bell, Shield, Save, Camera, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import styles from './SettingsPage.module.css';

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
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Profile Picture Section */}
            <div className={styles.profilePictureContainer}>
                <div className={styles.profilePictureWrapper}>
                    <div className={styles.profilePicture}>
                        <img
                            src={formData.pictureUrl || '/default-avatar.png'}
                            alt="Profile"
                            className={styles.profileImage}
                        />
                    </div>
                    <label className={styles.uploadButton}>
                        <Camera className={styles.uploadIcon} />
                        <input
                            type="file"
                            className={styles.fileInput}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>

            <div className={styles.formGrid}>
                {/* Basic Information */}
                <div className={styles.formSection}>
                    <div>
                        <label className={styles.fieldLabel}>Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={styles.textInput}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className={styles.disabledInput}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Country</label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            className={styles.textInput}
                        />
                    </div>
                </div>

                {/* Professional Information */}
                <div className={styles.formSection}>
                    <div>
                        <label className={styles.fieldLabel}>Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                            className={styles.textarea}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Skills (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.skills.join(', ')}
                            onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()) }))}
                            className={styles.textInput}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Languages (comma-separated)</label>
                        <input
                            type="text"
                            value={formData.languages.join(', ')}
                            onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value.split(',').map(s => s.trim()) }))}
                            className={styles.textInput}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formActions}>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                >
                    {isLoading ? (
                        <>
                            <svg className={styles.loadingSpinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className={styles.buttonIcon} />
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
        <form onSubmit={handleSubmit} className={styles.form}>
            {/* Profile Picture Section */}
            <div className={styles.profilePictureContainer}>
                <div className={styles.profilePictureWrapper}>
                    <div className={styles.profilePicture}>
                        <img
                            src={formData.pictureUrl || '/default-avatar.png'}
                            alt="Profile"
                            className={styles.profileImage}
                        />
                    </div>
                    <label className={styles.uploadButton}>
                        <Camera className={styles.uploadIcon} />
                        <input
                            type="file"
                            className={styles.fileInput}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>

            <div className={styles.formGrid}>
                {/* Basic Information */}
                <div className={styles.formSection}>
                    <div>
                        <label className={styles.fieldLabel}>Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={styles.textInput}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className={styles.disabledInput}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Country</label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                            className={styles.textInput}
                        />
                    </div>
                </div>

                {/* Company Information */}
                <div className={styles.formSection}>
                    <div>
                        <label className={styles.fieldLabel}>Company Name</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                            className={styles.textInput}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Company Info</label>
                        <textarea
                            value={formData.companyInfo}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyInfo: e.target.value }))}
                            rows={3}
                            className={styles.textarea}
                        />
                    </div>
                    <div>
                        <label className={styles.fieldLabel}>Company Website</label>
                        <input
                            type="url"
                            value={formData.companyLink}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyLink: e.target.value }))}
                            className={styles.textInput}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formActions}>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitButton}
                >
                    {isLoading ? (
                        <>
                            <svg className={styles.loadingSpinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className={styles.buttonIcon} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const LoadingSpinner = () => (
    <div className={styles.loadingSpinnerContainer}>
        <Loader className={styles.loadingSpinnerIcon} />
        <p className={styles.loadingSpinnerText}>Loading your settings...</p>
    </div>
);

const SettingsPage = () => {
    const { user } = useAuthStore();
    const { updateProfile, isLoading: isUpdating, getProfile } = useUserStore();
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setIsLoadingProfile(true);
                const data = await getProfile();
                setProfileData(data.user);
            } catch (error) {
                console.error('Error loading profile:', error);
                toast.error(error.message || 'Failed to load profile data');
            } finally {
                setIsLoadingProfile(false);
            }
        };

        if (user) {
            loadProfile();
        }
    }, [user, getProfile]);

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
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerContent}>
                            <h1 className={styles.pageTitle}>Settings</h1>
                        </div>
                        <div className={styles.tabsContainer}>
                            <nav className={styles.tabsList}>
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`${styles.tabButton} ${activeTab === 'profile' ? styles.tabButtonActive : styles.tabButtonInactive}`}
                                >
                                    <User className={styles.tabIcon} />
                                    Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`${styles.tabButton} ${activeTab === 'notifications' ? styles.tabButtonActive : styles.tabButtonInactive}`}
                                >
                                    <Bell className={styles.tabIcon} />
                                    Notifications
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`${styles.tabButton} ${activeTab === 'security' ? styles.tabButtonActive : styles.tabButtonInactive}`}
                                >
                                    <Shield className={styles.tabIcon} />
                                    Security
                                </button>
                            </nav>
                        </div>
                    </div>

                    <div className={styles.tabContent}>
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
                                className={styles.tabPanel}
                            >
                                <h3 className={styles.sectionTitle}>Notification Preferences</h3>
                                <div className={styles.formSection}>
                                    <div className={styles.settingItem}>
                                        <div className={styles.settingInfo}>
                                            <h4 className={styles.settingTitle}>Email Notifications</h4>
                                            <p className={styles.settingDescription}>Receive email notifications for important updates</p>
                                        </div>
                                        <button className={`${styles.toggleSwitch} ${styles.toggleSwitchActive}`}>
                                            <span className={`${styles.toggleHandle} ${styles.toggleHandleActive}`}></span>
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
                                className={styles.tabPanel}
                            >
                                <h3 className={styles.sectionTitle}>Security Settings</h3>
                                <div className={styles.formSection}>
                                    <div className={styles.settingItem}>
                                        <div className={styles.settingInfo}>
                                            <h4 className={styles.settingTitle}>Two-Factor Authentication</h4>
                                            <p className={styles.settingDescription}>Add an extra layer of security to your account</p>
                                        </div>
                                        <button className={`${styles.toggleSwitch} ${styles.toggleSwitchInactive}`}>
                                            <span className={`${styles.toggleHandle} ${styles.toggleHandleInactive}`}></span>
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