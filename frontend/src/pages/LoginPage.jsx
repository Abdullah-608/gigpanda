import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  // Generate floating bamboo elements for decoration
  const generateBambooElements = () => {
    return Array.from({ length: 8 }).map((_, i) => (
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
              Welcome Back
            </motion.h2>
            <motion.p 
              className={styles.leftPanelDescription}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Log in to continue your journey with GigPanda.
            </motion.p>
            
            <motion.div
              className={styles.featuresList}
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
                <span className={styles.featureText}>Find your next project</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <span className={styles.featureText}>Manage active contracts</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                    <rect x="9" y="9" width="12" height="10" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span className={styles.featureText}>Access secure payments</span>
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
              Sign In
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
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

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <motion.div 
              className={styles.formGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
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
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  className={styles.input}
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div 
              className={styles.formGroupPassword}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className={styles.labelContainer}>
                <label className={styles.inputLabel}>Password</label>
                <Link to="/forgot-password" className={styles.forgotPasswordLink}>
                  Forgot password?
                </Link>
              </div>
              <div 
                className={`${styles.inputWrapper} ${activeField === 'password' ? styles.inputWrapperActive : styles.inputWrapperInactive}`}
              >
                <div className={`${styles.inputIcon} ${activeField === 'password' ? styles.inputIconActive : styles.inputIconInactive}`}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  className={styles.passwordInput}
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
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    Sign In
                    <ArrowRight size={16} className={styles.arrowIcon} />
                  </motion.div>
                )}
              </span>
            </motion.button>

            <motion.div 
              className={styles.signUpContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              Don't have an account?{" "}
              <motion.span whileHover={{ x: 2 }} display="inline-block">
                <Link to="/signup" className={styles.signUpLink}>
                  Sign up
                </Link>
              </motion.span>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;