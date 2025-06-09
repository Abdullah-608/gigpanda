import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { ArrowLeft, Loader, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const { isLoading, forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await forgotPassword(email);
    setIsSubmitted(true);
  };

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
              Account Recovery
            </motion.h2>
            <motion.p 
              className={styles.leftPanelDescription}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We'll help you get back into your GigPanda account.
            </motion.p>
            
            <motion.div
              className={styles.stepsList}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Process steps */}
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>
                  <span className="text-sm">1</span>
                </div>
                <span className={styles.stepText}>Enter your email address</span>
              </div>
              
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>
                  <span className="text-sm">2</span>
                </div>
                <span className={styles.stepText}>Check your inbox for a reset link</span>
              </div>
              
              <div className={styles.stepItem}>
                <div className={styles.stepNumber}>
                  <span className="text-sm">3</span>
                </div>
                <span className={styles.stepText}>Create a new secure password</span>
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
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.formHeader}>
                  <motion.h1 
                    className={styles.formTitle}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    Forgot Password
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
                    <Mail size={20} className="text-green-600" />
                  </motion.div>
                </div>

                <motion.p 
                  className={styles.formDescription}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  Enter your email address and we'll send you a link to reset your password.
                </motion.p>

                <form onSubmit={handleSubmit}>
                  <motion.div 
                    className={styles.formGroup}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <label className={styles.inputLabel}>Email Address</label>
                    <div 
                      className={`${styles.inputWrapper} ${activeField === 'email' ? styles.inputWrapperActive : styles.inputWrapperInactive}`}
                    >
                      <div className={`${styles.inputIcon} ${activeField === 'email' ? styles.inputIconActive : styles.inputIconInactive}`}>
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
                        required
                      />
                    </div>
                  </motion.div>

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
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <motion.div 
                          className="flex items-center"
                          whileHover={{ x: 3 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          Send Reset Link
                          <ArrowRight size={16} className="ml-1.5" />
                        </motion.div>
                      )}
                    </span>
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className={styles.successContainer}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 20,
                    delay: 0.2
                  }}
                  className={styles.successIcon}
                >
                  <CheckCircle size={40} className="text-green-600" />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={styles.successTitle}
                >
                  Check Your Email
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={styles.successMessage}
                >
                  If an account exists for <span className="font-medium">{email}</span>, you'll receive a password reset link shortly.
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={styles.successSubtext}
                >
                  Please check your spam folder if you don't see it in your inbox.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link to="/login" className={styles.linkText}>
                    <ArrowLeft size={16} className={styles.linkIcon} />
                    Return to Login
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSubmitted && (
            <motion.div 
              className={styles.backLink}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Link to="/login" className={styles.linkText}>
                <ArrowLeft size={16} className={styles.linkIcon} />
                Back to Login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;