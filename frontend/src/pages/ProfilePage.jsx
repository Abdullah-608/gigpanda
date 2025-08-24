import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import toast from 'react-hot-toast';
import { 
  FaEdit, FaCheck, FaUser, FaTools, FaGraduationCap, 
  FaBriefcase, FaBuilding, FaMapMarkerAlt, FaLink, 
  FaCalendarAlt, FaGlobe, FaEnvelope, FaArrowLeft, FaStar
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import EditProfileModal from '../components/EditProfileModal';

const ProfilePage = () => {
  const { isLoading, error, getProfile, updateProfile } = useUserStore();
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [editSection, setEditSection] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Show loading toast
        const loadingToast = toast.loading('Loading profile data...');
        
        const data = await getProfile();
        
        // If we got valid data
        if (data && data.user) {
          // Combine user and profile data into one state
          setProfileData({
            ...data.user,
            ...data.user.profile // If profile exists in the response
          });
          
          // Set last updated timestamp
          setLastUpdated(new Date().toISOString());
          
          // Dismiss loading toast and show success
          toast.dismiss(loadingToast);
          toast.success('Profile loaded successfully');
        } else {
          throw new Error('Invalid profile data received');
        }
      } catch (error) {
        toast.error('Failed to load profile data');
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, [getProfile]);

  const handleEditClick = (section) => {
    setEditSection(section);
    setIsEditing(true);
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Updating profile...');
      
      // Create a consolidated profile object
      const updatedProfile = {
        ...profileData,
        ...updatedData
      };
      
      // Call the API to update
      await updateProfile(updatedProfile);
      
      // Update local state
      setProfileData(updatedProfile);
      
      // Update last updated timestamp
      setLastUpdated(new Date().toISOString());
      
      // Close the modal
      setIsEditing(false);
      
      // Show success message
      toast.dismiss(loadingToast);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading && !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-2xl text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUser className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Profile not found</h2>
          <p className="text-gray-600 mb-8 text-lg">The profile you're looking for doesn't exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg font-medium text-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="w-full bg-green-600 sticky top-0 z-50 shadow-lg">
        <div className="w-full flex items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-white hover:bg-green-700 py-2 px-4 rounded-lg transition-all"
            >
              <FaArrowLeft />
              <span className="font-medium hidden sm:block">Dashboard</span>
            </button>
          </div>
          <h1 className="text-white text-xl font-bold">My Profile</h1>
          <div className="flex items-center space-x-3">
            <span className="text-white/80 text-sm hidden sm:block">
              Last updated: {formatDate(lastUpdated)}
            </span>
            <button
              onClick={() => handleEditClick('personal')}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all"
            >
              <FaEdit size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Background */}
      <section className="w-full bg-gradient-to-r from-green-600 to-green-700 overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20 bg-pattern"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group w-40 h-40">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow"></div>
            <div className="w-40 h-40 rounded-full relative overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src={profileData?.pictureUrl || import.meta.env.VITE_DEFAULT_PROFILE_IMAGE || 'https://via.placeholder.com/150'} 
                alt={`${profileData.name}'s profile`}
                className="w-full h-full object-cover" 
              />
              {profileData.isVerified && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white p-2 rounded-full shadow-lg border-2 border-white">
                  <FaCheck size={16} />
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center md:text-left text-white">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2">
              {profileData.name}
            </h1>
            <p className="text-2xl text-green-200 mb-4 font-medium">
              {profileData.role || 'Professional Developer'}
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {profileData?.country && (
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <FaMapMarkerAlt />
                  <span>{profileData.country}</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <FaCalendarAlt />
                <span>Member since 2023</span>
              </div>
              {profileData.email && (
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <FaEnvelope />
                  <span>{profileData.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Top Skills Quick View */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-gray-500 font-medium">TOP SKILLS</h3>
            <div className="flex flex-wrap gap-2">
              {profileData?.skills?.slice(0, 5).map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-green-50 px-4 py-1.5 rounded-full text-sm text-green-700 border border-green-100 inline-block"
                >
                  {skill}
                </span>
              ))}
              {!profileData?.skills?.length && (
                <span className="text-gray-500 text-sm">No skills added yet</span>
              )}
              {profileData?.skills?.length > 5 && (
                <span className="bg-gray-50 px-4 py-1.5 rounded-full text-sm text-gray-700 border border-gray-200 inline-block">
                  +{profileData.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow w-full">
        {/* Tab Navigation */}
        <div className="w-full bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
          <div className="container mx-auto">
            <div className="flex overflow-x-auto hide-scrollbar">
              {[
                { id: 'about', label: 'About', icon: <FaUser /> },
                { id: 'skills', label: 'Skills & Languages', icon: <FaTools /> },
                { id: 'education', label: 'Education', icon: <FaGraduationCap /> },
                { id: 'projects', label: 'Projects', icon: <FaBriefcase /> },
                { id: 'company', label: 'Company', icon: <FaBuilding /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`
                    flex items-center justify-center gap-2 px-6 py-4 text-base font-medium whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'text-green-600 border-b-2 border-green-500' 
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}
                    transition-all duration-200
                  `}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="container mx-auto px-4 py-8">
          {/* About Section */}
          {activeTab === 'about' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaUser className="text-green-600" /> About Me
                </h2>
                <button
                  onClick={() => handleEditClick('about')}
                  className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                >
                  <FaEdit size={20} />
                </button>
              </div>
              
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                {profileData?.bio ? (
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">{profileData.bio}</p>
                ) : (
                  <div className="text-center py-16">
                    <FaUser size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-4">No bio provided yet.</p>
                    <button 
                      onClick={() => handleEditClick('about')} 
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                    >
                      Add Your Bio
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Skills Section */}
          {activeTab === 'skills' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaTools className="text-green-600" /> Skills & Languages
                </h2>
                <button
                  onClick={() => handleEditClick('skills')}
                  className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                >
                  <FaEdit size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-medium text-green-700 mb-6 pb-2 border-b border-gray-100 flex items-center">
                    <FaTools className="mr-2" /> Professional Skills
                  </h3>
                  {profileData?.skills && profileData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {profileData.skills.map((skill, index) => (
                        <div 
                          key={index} 
                          className="group bg-green-50 px-5 py-3 rounded-xl text-green-800 border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
                        >
                          <FaStar className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" size={12} />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 mb-4">No skills added yet.</p>
                      <button 
                        onClick={() => handleEditClick('skills')} 
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                      >
                        Add Skills
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-medium text-green-700 mb-6 pb-2 border-b border-gray-100 flex items-center">
                    <FaGlobe className="mr-2" /> Languages
                  </h3>
                  {profileData?.languages && profileData.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {profileData.languages.map((language, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-50 px-5 py-3 rounded-xl text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300"
                        >
                          {language}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-gray-500 mb-4">No languages added yet.</p>
                      <button 
                        onClick={() => handleEditClick('skills')} 
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                      >
                        Add Languages
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Education Section */}
          {activeTab === 'education' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaGraduationCap className="text-green-600" /> Education & Certifications
                </h2>
                <button
                  onClick={() => handleEditClick('education')}
                  className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                >
                  <FaEdit size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                    <FaGraduationCap className="text-green-600 mr-2" /> Education
                  </h3>
                  {profileData?.education && profileData.education.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.education.map((edu, index) => (
                        <div key={index} className="p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-colors shadow-sm hover:shadow-md">
                          <h4 className="font-bold text-gray-800">
                            {edu.split(',')[0] || edu}
                          </h4>
                          <p className="text-gray-600 mt-1">
                            {edu.split(',').slice(1).join(',') || 'No additional information'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <FaGraduationCap size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No education details added yet.</p>
                      <button 
                        onClick={() => handleEditClick('education')} 
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                      >
                        Add Education
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                    <FaCheck className="text-green-600 mr-2" /> Certifications
                  </h3>
                  {profileData?.certifications && profileData.certifications.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.certifications.map((cert, index) => (
                        <div key={index} className="p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-colors shadow-sm hover:shadow-md flex items-start gap-3">
                          <div className="text-green-500 text-xl mt-0.5 flex-shrink-0">•</div>
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {cert.split(',')[0] || cert}
                            </h4>
                            <p className="text-gray-600 mt-1">
                              {cert.split(',').slice(1).join(',') || 'No additional information'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <FaCheck size={36} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-4">No certifications added yet.</p>
                      <button 
                        onClick={() => handleEditClick('education')} 
                        className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                      >
                        Add Certifications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Projects Section */}
          {activeTab === 'projects' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaBriefcase className="text-green-600" /> Past Projects
                </h2>
                <button
                  onClick={() => handleEditClick('projects')}
                  className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                >
                  <FaEdit size={20} />
                </button>
              </div>
              
              {profileData?.pastProjects && profileData.pastProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileData.pastProjects.map((project, index) => (
                    <div 
                      key={index} 
                      className="p-6 bg-white rounded-xl border border-gray-200 hover:border-green-300 transition-all shadow-sm hover:shadow-lg group"
                    >
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-100 mb-4 group-hover:bg-green-200 transition-colors">
                        <FaBriefcase className="text-green-600" size={20} />
                      </div>
                      <h3 className="text-lg font-semibold text-green-700 mb-2">{`Project ${index + 1}`}</h3>
                      <p className="text-gray-700">{project}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <FaBriefcase size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No past projects added yet.</p>
                  <button 
                    onClick={() => handleEditClick('projects')} 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                  >
                    Add Your Projects
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Company Section */}
          {activeTab === 'company' && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaBuilding className="text-green-600" /> Company Information
                </h2>
                <button
                  onClick={() => handleEditClick('company')}
                  className="text-gray-500 hover:text-green-600 p-2 rounded-full hover:bg-green-50 transition-colors"
                >
                  <FaEdit size={20} />
                </button>
              </div>
              
              {profileData?.companyName ? (
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                  <div className="h-48 bg-gradient-to-r from-green-500 to-green-700 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="absolute inset-0 flex items-end p-8">
                      <div className="bg-white w-20 h-20 rounded-xl flex items-center justify-center border border-gray-100 shadow-lg">
                        <FaBuilding className="text-green-600 text-3xl" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">{profileData.companyName}</h3>
                    
                    {profileData.companyInfo && (
                      <p className="text-gray-700 leading-relaxed text-lg mb-8">{profileData.companyInfo}</p>
                    )}
                    
                    {profileData.companyLink && (
                      <a 
                        href={profileData.companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl shadow-md transition-all hover:shadow-lg"
                      >
                        <FaLink /> Visit Company Website
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <FaBuilding size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">No company information added yet.</p>
                  <button 
                    onClick={() => handleEditClick('company')} 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md"
                  >
                    Add Company Information
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
            <div className="mb-4 md:mb-0">
              <p>© 2025 Abdullah-cr. All Rights Reserved.</p>
            </div>
            <div className="flex items-center gap-6">
              <p>Profile ID: {userId || profileData.id || 'N/A'}</p>
              <p>Last updated: {formatDate(lastUpdated)}</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <EditProfileModal 
          user={profileData}
          profile={profileData}
          section={editSection}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

// Add this CSS to your global CSS file
const ProfileStyles = () => {
  return (
    <style jsx global>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes pulse-slow {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
      }
      
      .animate-pulse-slow {
        animation: pulse-slow 3s ease-in-out infinite;
      }
      
      .bg-pattern {
        background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      }
      
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>
  );
};

export default function EnhancedProfilePage() {
  return (
    <>
      <ProfileStyles />
      <ProfilePage />
    </>
  );
}