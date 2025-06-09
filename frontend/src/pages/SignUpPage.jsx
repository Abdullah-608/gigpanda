import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Eye, EyeOff, ArrowRight, Lock, Mail, User } from "lucide-react";
import styles from './SignUpPage.module.css';

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();

  const { signup, error, isLoading } = useAuthStore();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (!name || !email || !password) return;

    try {
      await signup(email, password, name, role);
      navigate("/verify-email", { 
        state: { 
          redirectAfterVerification: "/profile-setup",
          userName: name
        } 
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Password requirements
  const requirements = [
    { id: 'length', label: 'At least 6 characters', validate: pwd => pwd.length >= 6 },
    { id: 'uppercase', label: 'Contains uppercase letter', validate: pwd => /[A-Z]/.test(pwd) },
    { id: 'lowercase', label: 'Contains lowercase letter', validate: pwd => /[a-z]/.test(pwd) },
    { id: 'number', label: 'Contains a number', validate: pwd => /[0-9]/.test(pwd) }
  ];

  const validRequirements = requirements.filter(req => req.validate(password));
  const percentComplete = Math.ceil((validRequirements.length / requirements.length) * 100);

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

  return (
    <div className={styles.container}>
      {/* Left Panel - Decorative */}
      <div className={styles.leftPanel}>
        <div className="absolute inset-0 overflow-hidden">
          {/* Bamboo pattern */}
          <svg width="100%" height="100%" className={styles.bambooPattern}>
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
              className={styles.welcomeText}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Welcome to GigPanda
            </motion.h2>
            <motion.p 
              className={styles.welcomeDescription}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Connect with top talent and opportunities in our professional community.
            </motion.p>
            
            <motion.div
              className={styles.featureContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Feature highlights */}
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span className={styles.featureText}>Verified professionals</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <span className={styles.featureText}>Secure payments</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16V12"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </div>
                <span className={styles.featureText}>24/7 customer support</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <motion.div 
        className={styles.rightPanel}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <motion.h1 
              className={styles.formTitle}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Create Your Account
            </motion.h1>
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.3
              }}
              className={styles.userIcon}
            >
              <User size={20} className="text-green-600" />
            </motion.div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.errorMessage}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignUp}>
            {/* Name Field */}
            <motion.div 
              className={styles.inputGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className={styles.inputLabel}>Full Name</label>
              <div 
                className={`${styles.inputWrapper} ${
                  submitted && !name ? styles.inputWrapperError : 
                  activeField === 'name' ? styles.inputWrapperActive : ''
                }`}
              >
                <div className={`${styles.inputIcon} ${activeField === 'name' ? styles.inputIconActive : ''}`}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setActiveField('name')}
                  onBlur={() => setActiveField(null)}
                  className={styles.input}
                />
              </div>
              {submitted && !name && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  Name is required
                </motion.p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div 
              className={styles.inputGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className={styles.inputLabel}>Email Address</label>
              <div 
                className={`${styles.inputWrapper} ${
                  submitted && !email ? styles.inputWrapperError : 
                  activeField === 'email' ? styles.inputWrapperActive : ''
                }`}
              >
                <div className={`${styles.inputIcon} ${activeField === 'email' ? styles.inputIconActive : ''}`}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  className={styles.input}
                />
              </div>
              {submitted && !email && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  Email is required
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div 
              className={styles.inputGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className={styles.inputLabel}>Password</label>
              <div 
                className={`${styles.inputWrapper} ${
                  submitted && password.length < 6 ? styles.inputWrapperError : 
                  activeField === 'password' ? styles.inputWrapperActive : ''
                }`}
              >
                <div className={`${styles.inputIcon} ${activeField === 'password' ? styles.inputIconActive : ''}`}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {submitted && password.length < 6 && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-500"
                >
                  Password must be at least 6 characters
                </motion.p>
              )}
              
              {/* Password meter */}
              {password && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className={styles.passwordMeter}
                >
                  <div className="mb-2">
                    <div className={styles.passwordStrength}>
                      <span className={styles.strengthLabel}>Password strength</span>
                      <span className={`${styles.strengthValue} ${
                        percentComplete < 50 ? 'text-red-500' : 
                        percentComplete < 75 ? 'text-yellow-500' : 
                        'text-green-500'
                      }`}>
                        {percentComplete < 50 ? 'Weak' : 
                         percentComplete < 75 ? 'Good' : 
                         'Strong'}
                      </span>
                    </div>
                    
                    <div className={styles.strengthBar}>
                      <motion.div 
                        className={`${styles.strengthProgress} ${
                          percentComplete < 50 ? 'bg-red-500' : 
                          percentComplete < 75 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentComplete}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.requirementsList}>
                    {requirements.map((req) => (
                      <div key={req.id} className={styles.requirementItem}>
                        <motion.div 
                          initial={{ scale: 0.5 }}
                          animate={{ 
                            scale: req.validate(password) ? 1 : 0.5,
                            backgroundColor: req.validate(password) ? '#10B981' : '#D1D5DB',
                          }}
                          className={styles.requirementDot}
                        >
                          {req.validate(password) && (
                            <motion.svg 
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              width="8" 
                              height="8" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="white" 
                              strokeWidth="4" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </motion.svg>
                          )}
                        </motion.div>
                        <span className={`${styles.requirementText} ${req.validate(password) ? 'text-gray-700' : 'text-gray-500'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Role Selection */}
            <motion.div 
              className={styles.roleSelection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <label className={styles.inputLabel}>I want to join as:</label>
              <div className={styles.roleGrid}>
                <motion.button
                  type="button"
                  onClick={() => setRole("client")}
                  whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ y: 0 }}
                  className={`${styles.roleButton} ${role === "client" ? styles.roleButtonActive : styles.roleButtonInactive}`}
                >
                  {role === "client" && (
                    <motion.div
                      layoutId="selectedRole"
                      className="absolute inset-0 bg-green-600"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="font-medium relative z-10">Client</span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setRole("freelancer")}
                  whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ y: 0 }}
                  className={`${styles.roleButton} ${role === "freelancer" ? styles.roleButtonActive : styles.roleButtonInactive}`}
                >
                  {role === "freelancer" && (
                    <motion.div
                      layoutId="selectedRole"
                      className="absolute inset-0 bg-green-600"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="font-medium relative z-10">Freelancer</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <motion.span 
                className={styles.submitButtonHover}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className={styles.submitButtonText}>
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </span>
            </motion.button>

            {/* Login Link */}
            <p className="mt-6 text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Sign in
                </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;