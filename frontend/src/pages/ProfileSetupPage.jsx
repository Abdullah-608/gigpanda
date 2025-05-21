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
        
        // Fix professional data nesting if needed
        let professionalData = data.professional;
        if (professionalData && professionalData.professional) {
            professionalData = professionalData.professional;
        }
        
        setFormData(prevData => {
            const newData = { ...prevData };
            
            // Handle personal data
            if (data.personal) {
                newData.personal = { ...prevData.personal, ...data.personal };
            }
            
            // Handle professional data - fixed
            if (professionalData) {
                newData.professional = professionalData;
            }
            
            console.log("Updated form data:", newData);
            // Update ref immediately
            formDataRef.current = newData;
            return newData;
        });
    };
    
    // Store professional data directly when submitted
    const [latestProfessionalData, setLatestProfessionalData] = useState(null);
    
    const handleProfessionalSubmit = (data) => {
        console.log("Professional data received directly:", data);
        // Store the professional data directly - no nesting
        setLatestProfessionalData(data);
        // Update the form data - wrap it for the form structure
        updateFormData({ professional: data });
        
        // Instead of waiting for state updates, pass the data directly to complete setup
        const timer = setTimeout(() => {
            handleCompleteSetupWithData(data);
        }, 100);
        
        return () => clearTimeout(timer);
    };
    
    // New function that takes professional data directly as a parameter
    const handleCompleteSetupWithData = async (professionalData) => {
        setIsSubmitting(true);
        try {
            console.log('Professional data passed directly:', professionalData);
            
            // Structure the data for the API
            const structuredData = {
                email: user.email,
                userType: userType,
                personal: {
                    name: formData.personal?.name || user.name || 'Anonymous User',
                    bio: formData.personal?.bio || 'No bio provided',
                    country: formData.personal?.country || 'Not Specified',
                    pictureUrl: formData.personal?.pictureUrl || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
                    languages: Array.isArray(formData.personal?.languages) && formData.personal.languages.length > 0 ? formData.personal.languages : ['English']
                }
            };

            // Handle professional data based on user type - using directly passed data
            if (userType === 'freelancer') {
                console.log('Using directly passed professional data:', professionalData);
                structuredData.professional = {
                    skills: professionalData?.skills || ['Not Specified'],
                    education: professionalData?.education || ['Not Specified'],
                    certifications: professionalData?.certifications || ['None']
                };
            } else {
                structuredData.professional = {
                    companyName: professionalData?.companyName || 'Not Specified',
                    companyInfo: professionalData?.companyInfo || 'Not Specified',
                    companyLink: professionalData?.companyLink || 'https://example.com',
                    pastProjects: professionalData?.pastProjects || ['None']
                };
            }

            console.log('Final structured data being sent to API:', JSON.stringify(structuredData, null, 2));

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
    
    // Keep this for backward compatibility - it should now rarely be called directly
    const handleCompleteSetup = async () => {
        // Use form data as fallback
        const professionalData = formData.professional || {};
        handleCompleteSetupWithData(professionalData);
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
                        updateFormData={handleProfessionalSubmit}
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