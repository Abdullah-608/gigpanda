import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, ArrowRight, Loader } from "lucide-react";
import toast from "react-hot-toast";
import styles from './ResetPasswordPage.module.css';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const { resetPassword, error, isLoading, message } = useAuthStore();

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      await resetPassword(token, password);

      toast.success("Password reset successfully, redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error resetting password");
    }
  };

  // Password requirements
  const requirements = [
    { id: 'length', label: 'At least 6 characters', validate: pwd => pwd.length >= 6 },
    { id: 'match', label: 'Passwords match', validate: () => password === confirmPassword && confirmPassword !== "" }
  ];

  const validRequirements = requirements.filter(req => req.validate(password));
  const percentComplete = Math.ceil((validRequirements.length / requirements.length) * 100);

  // Generate floating bamboo elements for decoration
  const generateBambooElements = () => {
    return Array.from({ length: 6 }).map((_, i) => (
      <motion.div
        key={i}
        className={styles.bambooElement}
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
            Math.random() * 100 - 50
          ],
          y: [
            Math.random() * 100 - 50,
            Math.random() * 100 - 50,
            Math.random() * 100 - 50
          ],
          opacity: [0.3, 0.6, 0.3],
          scale: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 15 + Math.random() * 10,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          width: `${20 + Math.random() * 30}px`,
          height: `${60 + Math.random() * 80}px`,
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
            className={styles.animatedCircle}
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
            className={styles.animatedCircle}
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
        <div className={styles.leftPanelContent}>
          <div className={styles.leftPanelText}>
            <motion.h2 
              className={styles.leftPanelTitle}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Secure Your Account
            </motion.h2>
            <motion.p 
              className={styles.leftPanelDescription}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Set a strong password to protect your GigPanda account.
            </motion.p>
            
            <motion.div
              className={styles.securityTipsList}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Security tips */}
              <div className={styles.securityTipItem}>
                <div className={styles.securityTipIcon}>
                  <Check size={16} />
                </div>
                <span className={styles.securityTipText}>Use at least 8 characters</span>
              </div>
              
              <div className={styles.securityTipItem}>
                <div className={styles.securityTipIcon}>
                  <Check size={16} />
                </div>
                <span className={styles.securityTipText}>Include numbers and symbols</span>
              </div>
              
              <div className={styles.securityTipItem}>
                <div className={styles.securityTipIcon}>
                  <Check size={16} />
                </div>
                <span className={styles.securityTipText}>Avoid using common words</span>
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
              Reset Password
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
              className={styles.formIcon}
            >
              <Lock size={20} className="text-green-600" />
            </motion.div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.errorMessage}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={styles.successMessage}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            {/* New Password Input */}
            <motion.div 
              className={styles.formGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className={styles.inputLabel}>New Password</label>
              <div 
                className={`${styles.inputWrapper} ${activeField === 'password' ? styles.inputWrapperActive : styles.inputWrapperInactive}`}
              >
                <div className={`${styles.inputIcon} ${activeField === 'password' ? styles.inputIconActive : styles.inputIconInactive}`}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div 
              className={styles.formGroupPassword}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className={styles.inputLabel}>Confirm Password</label>
              <div 
                className={`${styles.inputWrapper} ${activeField === 'confirm' ? styles.inputWrapperActive : styles.inputWrapperInactive}`}
              >
                <div className={`${styles.inputIcon} ${activeField === 'confirm' ? styles.inputIconActive : styles.inputIconInactive}`}>
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setActiveField('confirm')}
                  onBlur={() => setActiveField(null)}
                  className={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.passwordToggle}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Password Requirements */}
            {(password || confirmPassword) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className={styles.requirementsContainer}
              >
                <div className={styles.requirementsHeader}>
                  <div className={styles.requirementsHeaderContent}>
                    <span className={styles.requirementsTitle}>Password requirements</span>
                    <span className={`${styles.requirementsStatus} ${
                      percentComplete < 50 ? styles.requirementsStatusIncomplete : 
                      percentComplete < 100 ? styles.requirementsStatusInProgress : 
                      styles.requirementsStatusComplete
                    }`}>
                      {percentComplete < 50 ? 'Incomplete' : 
                       percentComplete < 100 ? 'Almost there' : 
                       'Complete'}
                    </span>
                  </div>
                  
                  <div className={styles.progressBar}>
                    <motion.div 
                      className={`${styles.progressBarFill} ${
                        percentComplete < 50 ? styles.progressBarIncomplete : 
                        percentComplete < 100 ? styles.progressBarInProgress : 
                        styles.progressBarComplete
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
                      <span className={`${styles.requirementText} ${req.validate(password) ? styles.requirementTextActive : styles.requirementTextInactive}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -5px rgba(76, 175, 80, 0.2)" }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <motion.span 
                className={styles.buttonHoverOverlay}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className={styles.buttonContent}>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader className={styles.loadingSpinner} size={16} />
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    Set New Password
                    <ArrowRight size={16} className={styles.arrowIcon} />
                  </motion.div>
                )}
              </span>
            </motion.button>

            <motion.div 
              className={styles.loginContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              Remember your password?{" "}
              <motion.span whileHover={{ x: 2 }} display="inline-block">
                <Link to="/login" className={styles.loginLink}>
                  Back to login
                </Link>
              </motion.span>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;