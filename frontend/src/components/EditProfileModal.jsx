import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUser, FaTools, FaGraduationCap, FaBriefcase, FaBuilding } from 'react-icons/fa';

const EditProfileModal = ({ user, profile, section, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    languages: profile?.languages || [],
    education: profile?.education || [],
    certifications: profile?.certifications || [],
    pastProjects: profile?.pastProjects || [],
    companyName: profile?.companyName || '',
    companyInfo: profile?.companyInfo || '',
    companyLink: profile?.companyLink || '',
    country: profile?.country || ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newEducation, setNewEducation] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newProject, setNewProject] = useState('');

  useEffect(() => {
    // Reset form data when profile or section changes
    setFormData({
      name: user?.name || '',
      role: user?.role || '',
      bio: profile?.bio || '',
      skills: profile?.skills || [],
      languages: profile?.languages || [],
      education: profile?.education || [],
      certifications: profile?.certifications || [],
      pastProjects: profile?.pastProjects || [],
      companyName: profile?.companyName || '',
      companyInfo: profile?.companyInfo || '',
      companyLink: profile?.companyLink || '',
      country: profile?.country || ''
    });
  }, [user, profile, section]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addItem = (field, item, setItem) => {
    if (!item.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), item]
    }));
    setItem('');
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const getSectionTitle = () => {
    switch(section) {
      case 'personal': return 'Edit Personal Information';
      case 'about': return 'Edit About Me';
      case 'skills': return 'Edit Skills & Languages';
      case 'education': return 'Edit Education & Certifications';
      case 'projects': return 'Edit Projects';
      case 'company': return 'Edit Company Information';
      default: return 'Edit Profile';
    }
  };

  const getSectionIcon = () => {
    switch(section) {
      case 'personal': 
      case 'about': return <FaUser className="text-green-600" />;
      case 'skills': return <FaTools className="text-green-600" />;
      case 'education': return <FaGraduationCap className="text-green-600" />;
      case 'projects': return <FaBriefcase className="text-green-600" />;
      case 'company': return <FaBuilding className="text-green-600" />;
      default: return <FaUser className="text-green-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-green-600 text-white p-5 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {getSectionIcon()} {getSectionTitle()}
          </h2>
          <button 
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-grow overflow-y-auto p-6">
          <form id="editProfileForm" onSubmit={handleSubmit}>
            {/* Personal Information */}
            {(section === 'personal') && (
              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="role" className="block text-gray-700 font-medium mb-2">Professional Role</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="country" className="block text-gray-700 font-medium mb-2">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="e.g. United States"
                  />
                </div>
              </div>
            )}
            
            {/* About Me */}
            {(section === 'about') && (
              <div className="form-group">
                <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  placeholder="Write something about yourself..."
                ></textarea>
              </div>
            )}
            
            {/* Skills & Languages */}
            {(section === 'skills') && (
              <div className="space-y-8">
                <div className="form-group">
                  <label className="block text-gray-700 font-medium mb-4">Skills</label>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('skills', newSkill, setNewSkill)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {formData.skills.length > 0 ? (
                      formData.skills.map((skill, index) => (
                        <div key={index} className="bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2">
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeItem('skills', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 w-full text-center py-4">No skills added yet</p>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="block text-gray-700 font-medium mb-4">Languages</label>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Add a language"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('languages', newLanguage, setNewLanguage)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {formData.languages.length > 0 ? (
                      formData.languages.map((language, index) => (
                        <div key={index} className="bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center gap-2">
                          <span>{language}</span>
                          <button
                            type="button"
                            onClick={() => removeItem('languages', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 w-full text-center py-4">No languages added yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Education & Certifications */}
            {(section === 'education') && (
              <div className="space-y-8">
                <div className="form-group">
                  <label className="block text-gray-700 font-medium mb-4">Education</label>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newEducation}
                      onChange={(e) => setNewEducation(e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Add education (e.g. University Name, Degree, Year)"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('education', newEducation, setNewEducation)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.education.length > 0 ? (
                      formData.education.map((edu, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                          <span>{edu}</span>
                          <button
                            type="button"
                            onClick={() => removeItem('education', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 w-full text-center py-4 bg-gray-50 rounded-lg">No education added yet</p>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="block text-gray-700 font-medium mb-4">Certifications</label>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Add certification (e.g. AWS Certified Solutions Architect, 2023)"
                    />
                    <button
                      type="button"
                      onClick={() => addItem('certifications', newCertification, setNewCertification)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.certifications.length > 0 ? (
                      formData.certifications.map((cert, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                          <span>{cert}</span>
                          <button
                            type="button"
                            onClick={() => removeItem('certifications', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 w-full text-center py-4 bg-gray-50 rounded-lg">No certifications added yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Projects */}
            {(section === 'projects') && (
              <div className="form-group">
                <label className="block text-gray-700 font-medium mb-4">Past Projects</label>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    placeholder="Add project description"
                  />
                  <button
                    type="button"
                    onClick={() => addItem('pastProjects', newProject, setNewProject)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.pastProjects.length > 0 ? (
                    formData.pastProjects.map((project, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                        <span className="flex-grow">{project}</span>
                        <button
                          type="button"
                          onClick={() => removeItem('pastProjects', index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 w-full text-center py-4 bg-gray-50 rounded-lg">No projects added yet</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Company */}
            {(section === 'company') && (
              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="companyName" className="block text-gray-700 font-medium mb-2">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="companyInfo" className="block text-gray-700 font-medium mb-2">Company Description</label>
                  <textarea
                    id="companyInfo"
                    name="companyInfo"
                    value={formData.companyInfo}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="Write something about your company..."
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label htmlFor="companyLink" className="block text-gray-700 font-medium mb-2">Company Website</label>
                  <input
                    type="url"
                    id="companyLink"
                    name="companyLink"
                    value={formData.companyLink}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-5 border-t border-gray-200 flex items-center justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="editProfileForm"
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <FaSave /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;