import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { useUserStore } from "../store/userStore";
import { motion } from "framer-motion";

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
    
    // Generate floating bamboo elements for decoration
    const generateBambooElements = () => {
        return Array.from({ length: 8 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute bg-white/10 rounded-full"
                initial={{
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    opacity: 0,
                    scale: 0.5
                }}
                animate={{
                    x: [
                        Math.random() * 100 - 50,
                        Math.random() * 100 - 50,
                        Math.random() * 100 - 50,
                        Math.random() * 100 - 50
                    ],
                    y: [
                        Math.random() * 100 - 50,
                        Math.random() * 100 - 50,
                        Math.random() * 100 - 50,
                        Math.random() * 100 - 50
                    ],
                    opacity: [0.3, 0.6, 0.4, 0.3],
                    scale: [0.5, 0.8, 0.6, 0.5]
                }}
                transition={{
                    duration: 20 + Math.random() * 10,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    width: `${20 + Math.random() * 40}px`,
                    height: `${80 + Math.random() * 120}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transformOrigin: "center"
                }}
            />
        ));
    };
    
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
        setLatestProfessionalData(data);
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
        <div className="w-full max-w-[65%] md:max-w-[65rem] mx-auto flex overflow-hidden rounded-2xl shadow-xl">
            {/* Left Panel - Decorative */}
            <div className="hidden md:block w-1/3 bg-gradient-to-br from-green-600 to-green-800 relative">
                <div className="absolute inset-0 overflow-hidden">
                    {/* Bamboo pattern */}
                    <svg width="100%" height="100%" className="absolute top-0 left-0 opacity-10">
                        <pattern id="bamboo-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                            <line x1="15" y1="0" x2="15" y2="30" stroke="white" strokeWidth="2" strokeDasharray="1 4" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#bamboo-pattern)" />
                    </svg>
                    
                    {/* Floating bamboo elements */}
                    {generateBambooElements()}
                    
                    {/* Animated circles */}
                    <motion.div
                        className="absolute w-40 h-40 rounded-full bg-white/5"
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 20, 0],
                            y: [0, -20, 0]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ top: '20%', left: '30%' }}
                    />
                    <motion.div
                        className="absolute w-60 h-60 rounded-full bg-white/5"
                        animate={{
                            scale: [1, 0.8, 1],
                            x: [0, -10, 0],
                            y: [0, 30, 0]
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ bottom: '10%', right: '-20%' }}
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white p-8 text-center z-10">
                        <motion.h2 
                            className="text-3xl font-bold mb-4"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {activeStep === 1 ? "Tell Us About Yourself" : "Professional Details"}
                        </motion.h2>
                        <motion.p 
                            className="opacity-80"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {activeStep === 1 
                                ? "Let's create your professional profile." 
                                : "Share your expertise with potential clients."}
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <motion.div 
                className="w-full md:w-2/3 bg-white p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="max-w-3xl mx-auto">
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
            </motion.div>
        </div>
    );
}

export default ProfileSetupPage; 