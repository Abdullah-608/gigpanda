import { useState } from 'react';

const ProfessionalInfoCard = ({ formData, updateFormData, onBack, onComplete, isSubmitting, userType }) => {
  const isFreelancer = userType === 'freelancer';
  
  // Client form state
  const [companyName, setCompanyName] = useState(formData.companyName || '');
  const [companyInfo, setCompanyInfo] = useState(formData.companyInfo || '');
  const [companyLink, setCompanyLink] = useState(formData.companyLink || '');
  const [pastProjects, setPastProjects] = useState(formData.pastProjects || ['']);
  
  // Freelancer form state
  const [skills, setSkills] = useState(formData.skills || ['']);
  const [education, setEducation] = useState(formData.education || ['']);
  const [certifications, setCertifications] = useState(formData.certifications || ['']);
  
  // Common state
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    
    if (!isFreelancer) {
      if (!companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!companyInfo.trim()) newErrors.companyInfo = 'Company information is required';
      
      // Validate past projects (remove empty entries)
      const validPastProjects = pastProjects.filter(project => project.trim() !== '');
      if (validPastProjects.length === 0) {
        newErrors.pastProjects = 'At least one past project is required';
      }
    } else {
      // Validate skills (remove empty entries)
      const validSkills = skills.filter(skill => skill.trim() !== '');
      if (validSkills.length === 0) {
        newErrors.skills = 'At least one skill is required';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Update form data and complete setup
    const professionalData = !isFreelancer ? {
      companyName: companyName.trim(),
      companyInfo: companyInfo.trim(),
      companyLink: companyLink.trim(),
      pastProjects: pastProjects.filter(project => project.trim() !== '')
    } : {
      skills: skills.filter(skill => skill.trim() !== ''),
      education: education.filter(edu => edu.trim() !== ''),
      certifications: certifications.filter(cert => cert.trim() !== '')
    };

    console.log('Professional data being submitted:', professionalData);
    // Send the data directly, not wrapped in a professional object
    updateFormData(professionalData);
    // The parent component now handles completion timing
  };
  
  // Array field handlers for client
  const handlePastProjectChange = (index, value) => {
    const newProjects = [...pastProjects];
    newProjects[index] = value;
    setPastProjects(newProjects);
  };
  
  const addPastProject = () => {
    setPastProjects([...pastProjects, '']);
  };
  
  const removePastProject = (index) => {
    if (pastProjects.length > 1) {
      const newProjects = [...pastProjects];
      newProjects.splice(index, 1);
      setPastProjects(newProjects);
    }
  };
  
  // Array field handlers for freelancer
  const handleSkillChange = (index, value) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };
  
  const addSkill = () => {
    setSkills([...skills, '']);
  };
  
  const removeSkill = (index) => {
    if (skills.length > 1) {
      const newSkills = [...skills];
      newSkills.splice(index, 1);
      setSkills(newSkills);
    }
  };
  
  const handleEducationChange = (index, value) => {
    const newEducation = [...education];
    newEducation[index] = value;
    setEducation(newEducation);
  };
  
  const addEducation = () => {
    setEducation([...education, '']);
  };
  
  const removeEducation = (index) => {
    if (education.length > 1) {
      const newEducation = [...education];
      newEducation.splice(index, 1);
      setEducation(newEducation);
    }
  };
  
  const handleCertificationChange = (index, value) => {
    const newCertifications = [...certifications];
    newCertifications[index] = value;
    setCertifications(newCertifications);
  };
  
  const addCertification = () => {
    setCertifications([...certifications, '']);
  };
  
  const removeCertification = (index) => {
    if (certifications.length > 1) {
      const newCertifications = [...certifications];
      newCertifications.splice(index, 1);
      setCertifications(newCertifications);
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isFreelancer ? 'Tell us about your expertise' : 'Tell us about your company'}
      </h2>
      <p className="text-gray-600 mb-6">
        {isFreelancer 
          ? 'Share your professional skills and qualifications' 
          : 'Share details about your company and projects'
        }
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Client Fields */}
          {!isFreelancer && (
            <>
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Enter your company name"
                />
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>
              
              {/* Company Info */}
              <div>
                <label htmlFor="companyInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Information
                </label>
                <textarea
                  id="companyInfo"
                  value={companyInfo}
                  onChange={(e) => setCompanyInfo(e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border ${errors.companyInfo ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                  placeholder="Tell us about your company"
                />
                {errors.companyInfo && <p className="mt-1 text-sm text-red-600">{errors.companyInfo}</p>}
              </div>
              
              {/* Company Link */}
              <div>
                <label htmlFor="companyLink" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Website
                </label>
                <input
                  type="url"
                  id="companyLink"
                  value={companyLink}
                  onChange={(e) => setCompanyLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://your-company.com"
                />
              </div>
              
              {/* Past Projects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Past Projects
                </label>
                {pastProjects.map((project, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={project}
                      onChange={(e) => handlePastProjectChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter a past project"
                    />
                    <button
                      type="button"
                      onClick={() => removePastProject(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={pastProjects.length === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPastProject}
                  className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Project
                </button>
                {errors.pastProjects && <p className="mt-1 text-sm text-red-600">{errors.pastProjects}</p>}
              </div>
            </>
          )}
          
          {/* Freelancer Fields */}
          {isFreelancer && (
            <>
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter a skill"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={skills.length === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Skill
                </button>
                {errors.skills && <p className="mt-1 text-sm text-red-600">{errors.skills}</p>}
              </div>
              
              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                {education.map((edu, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={edu}
                      onChange={(e) => handleEducationChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter education details"
                    />
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={education.length === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Education
                </button>
              </div>
              
              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certifications
                </label>
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => handleCertificationChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter certification details"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700"
                      disabled={certifications.length === 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCertification}
                  className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add Certification
                </button>
              </div>
            </>
          )}
          
          {/* Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Complete Setup
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalInfoCard; 