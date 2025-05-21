import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";

// Import the components from the integrate project
// We'll create these files next
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import ProfessionalInfoCard from "../components/profile/ProfessionalInfoCard";
import ProgressStepper from "../components/profile/ProgressStepper";

function ProfileSetupPage() {
    const { user } = useAuthStore();
    const { updateProfile, isLoading: isSubmittingProfile } = useUserStore();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [formData, setFormData] = useState({
        personal: {
            name: user?.name || '',
            bio: '',
            country: '',
            pictureUrl: '',
            languages: ['English']
        },
        professional: {}
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Create a ref to track the latest form data
    const formDataRef = useRef(formData);
    
    // Update ref whenever formData changes
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);
    
    // Get the userType from the user's role (you may need to adjust this based on your user model)
    const userType = user?.role === 'freelancer' ? 'freelancer' : 'client';
    
    const steps = ['Personal', 'Professional'];
    
    const updateFormData = (data) => {
        console.log("Raw data received in updateFormData:", data);
        setFormData(prevData => {
            const newData = { ...prevData };
            
            // Handle personal data
            if (data.personal) {
                newData.personal = { ...newData.personal, ...data.personal };
            }
            
            // Handle professional data
            if (data.professional) {
                console.log("Setting professional data:", data.professional);
                newData.professional = data.professional;
            }
            
            console.log("Updated form data:", newData);
            return newData;
        });
    };
    
    const nextStep = () => {
        if (activeStep === 1) {
            setCompletedSteps([0]);
        }
        setActiveStep(activeStep + 1);
    };
    
    const prevStep = () => {
        if (activeStep === 2) {
            setCompletedSteps([]);
        }
        setActiveStep(activeStep - 1);
    };
    
    const handleCompleteSetup = async () => {
        setIsSubmitting(true);
        try {
            // Use the ref to get the latest form data
            const currentFormData = formDataRef.current;
            console.log('Current form data before API call:', currentFormData);
            
            // Structure the data for the API
            const structuredData = {
                email: user.email,
                userType: userType,
                personal: {
                    name: currentFormData.personal?.name || user.name || 'Anonymous User',
                    bio: currentFormData.personal?.bio || 'No bio provided',
                    country: currentFormData.personal?.country || 'Not Specified',
                    pictureUrl: currentFormData.personal?.pictureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                    languages: Array.isArray(currentFormData.personal?.languages) && currentFormData.personal.languages.length > 0 ? currentFormData.personal.languages : ['English']
                }
            };

            // Handle professional data based on user type
            if (userType === 'freelancer') {
                console.log('Professional data from form:', currentFormData.professional);
                if (currentFormData.professional) {
                    structuredData.professional = {
                        skills: currentFormData.professional.skills || ['Not Specified'],
                        education: currentFormData.professional.education || ['Not Specified'],
                        certifications: currentFormData.professional.certifications || ['None']
                    };
                } else {
                    structuredData.professional = {
                        skills: ['Not Specified'],
                        education: ['Not Specified'],
                        certifications: ['None']
                    };
                }
            } else {
                if (currentFormData.professional) {
                    structuredData.professional = {
                        companyName: currentFormData.professional.companyName || 'Not Specified',
                        companyInfo: currentFormData.professional.companyInfo || 'Not Specified',
                        companyLink: currentFormData.professional.companyLink || 'https://example.com',
                        pastProjects: currentFormData.professional.pastProjects || ['None']
                    };
                } else {
                    structuredData.professional = {
                        companyName: 'Not Specified',
                        companyInfo: 'Not Specified',
                        companyLink: 'https://example.com',
                        pastProjects: ['None']
                    };
                }
            }

            console.log('Final structured data being sent to API:', structuredData);

            // Use the store to update profile
            const response = await updateProfile(structuredData);
            console.log('Profile update response:', response);
            
            // On success
            setCompletedSteps([...completedSteps, activeStep - 1]);
            toast.success('Profile setup completed successfully!');
            
            // Redirect to dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Profile setup error:', error);
            toast.error(error.message || 'Failed to complete setup. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto max-w-4xl bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg p-6 my-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h1>
            
            {/* Stepper */}
            <div className="mb-8">
                <ProgressStepper
                    steps={steps}
                    activeStep={activeStep - 1}
                    completed={completedSteps}
                />
            </div>

            {/* Form Steps */}
            <div className="transition-all duration-300">
                {activeStep === 1 && (
                    <PersonalInfoCard
                        formData={formData.personal || {}}
                        updateFormData={(data) => updateFormData({ personal: data })}
                        onNext={nextStep}
                    />
                )}
                
                {activeStep === 2 && (
                    <ProfessionalInfoCard
                        formData={formData.professional || {}}
                        updateFormData={(data) => updateFormData({ professional: data })}
                        onBack={prevStep}
                        onComplete={handleCompleteSetup}
                        isSubmitting={isSubmitting || isSubmittingProfile}
                        userType={userType}
                    />
                )}
            </div>
        </div>
    );
}

export default ProfileSetupPage; 