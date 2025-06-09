import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { CheckCircle, Loader, RefreshCw } from "lucide-react";
import styles from './EmailVerificationPage.module.css';

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { error, isLoading, verifyEmail, resendVerificationCode } = useAuthStore();

  const handleChange = (index, value) => {
    const newCode = [...code];

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      // Focus on the last non-empty input or the first empty one
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
      setActiveIndex(focusIndex);
    } else {
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
        setActiveIndex(index + 1);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
      setActiveIndex(index - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode);
      
      // Check if there's a redirect path in the location state
      const redirectPath = location.state?.redirectAfterVerification || "/dashboard";
      navigate(redirectPath);
      
      toast.success("Email verified successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      await resendVerificationCode();
      toast.success("Verification code resent to your email");
      // Reset the verification code inputs
      setCode(["", "", "", "", "", ""]);
      // Focus on the first input
      inputRefs.current[0].focus();
      setActiveIndex(0);
    } catch (error) {
      toast.error("Failed to resend verification code");
      console.error(error);
    } finally {
      setIsResending(false);
    }
  };

  // Auto submit when all fields are filled
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

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
            className={`${styles.decorativeCircle} ${styles.decorativeCircleLarge}`}
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
            className={`${styles.decorativeCircle} ${styles.decorativeCircleExtraLarge}`}
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
        <div className={styles.leftContent}>
          <div className={styles.leftContentInner}>
            <motion.h2 
              className={styles.welcomeTitle}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Almost There!
            </motion.h2>
            <motion.p 
              className={styles.welcomeDescription}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Verify your email to complete your GigPanda registration.
            </motion.p>
            
            <motion.div
              className={styles.featureList}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Information points */}
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <CheckCircle size={16} />
                </div>
                <span className={styles.featureText}>Verified professional status</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <CheckCircle size={16} />
                </div>
                <span className={styles.featureText}>Increased trust with clients</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <CheckCircle size={16} />
                </div>
                <span className={styles.featureText}>Access to all platform features</span>
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
              Verify Your Email
            </motion.h1>
          </div>

          <motion.p 
            className={styles.formDescription}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Enter the 6-digit code sent to your email address
          </motion.p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <motion.div 
              className={styles.codeInputContainer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {code.map((digit, index) => (
                <div key={index} className={styles.codeInputWrapper}>
                  <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="6"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(null)}
                    className={`${styles.codeInput} ${
                      activeIndex === index ? styles.codeInputActive : styles.codeInputInactive
                    }`}
                  />
                  <AnimatePresence>
                    {digit && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={styles.codeInputDot}
                      >
                        <div className={styles.codeInputDotInner}></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={styles.errorMessage}
                >
                  <p className={styles.errorText}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -5px rgba(76, 175, 80, 0.2)" }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading || code.some((digit) => !digit)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <motion.span 
                className={styles.submitButtonHover}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className={styles.submitButtonContent}>
                {isLoading ? (
                  <div className={styles.loadingIndicator}>
                    <Loader className={styles.loadingIcon} size={16} />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify Email"
                )}
              </span>
            </motion.button>

            <motion.div 
              className={styles.resendContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <p className={styles.resendText}>
                Didn't receive a code?{" "}
                <button 
                  type="button" 
                  onClick={handleResendCode}
                  disabled={isResending}
                  className={styles.resendButton}
                >
                  {isResending ? (
                    <>
                      <RefreshCw size={14} className={styles.resendingIcon} />
                      Sending...
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;