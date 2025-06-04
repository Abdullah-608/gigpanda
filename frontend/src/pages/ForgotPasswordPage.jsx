import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { ArrowLeft, Loader, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="w-full max-w-4xl mx-auto flex overflow-hidden rounded-2xl shadow-xl">
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
              Account Recovery
            </motion.h2>
            <motion.p 
              className="opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              We'll help you get back into your GigPanda account.
            </motion.p>
            
            <motion.div
              className="mt-8 flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Process steps */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm">1</span>
                </div>
                <span className="text-sm text-left">Enter your email address</span>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm">2</span>
                </div>
                <span className="text-sm text-left">Check your inbox for a reset link</span>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm">3</span>
                </div>
                <span className="text-sm text-left">Create a new secure password</span>
              </div>
            </motion.div>
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
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <motion.h1 
                    className="text-2xl font-bold text-gray-900"
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
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100"
                  >
                    <Mail size={20} className="text-green-600" />
                  </motion.div>
                </div>

                <motion.p 
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  Enter your email address and we'll send you a link to reset your password.
                </motion.p>

                <form onSubmit={handleSubmit}>
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div 
                      className={`flex border ${activeField === 'email' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'} rounded-lg overflow-hidden transition-all duration-200`}
                    >
                      <div className={`flex items-center justify-center w-12 bg-gray-50 ${activeField === 'email' ? 'text-green-600' : 'text-gray-400'}`}>
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setActiveField('email')}
                        onBlur={() => setActiveField(null)}
                        className="w-full px-4 py-3 text-gray-700 outline-none"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center transition duration-200 hover:bg-green-700 relative overflow-hidden"
                    whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -5px rgba(76, 175, 80, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isLoading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <motion.span 
                      className="absolute inset-0 bg-green-700 origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center">
                      {isLoading ? (
                        <div className="flex items-center">
                          <Loader className="animate-spin mr-2" size={16} />
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
                className="text-center py-8"
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
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle size={40} className="text-green-600" />
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold text-gray-800 mb-3"
                >
                  Check Your Email
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mb-2"
                >
                  If an account exists for <span className="font-medium">{email}</span>, you'll receive a password reset link shortly.
                </motion.p>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-500 text-sm mb-8"
                >
                  Please check your spam folder if you don't see it in your inbox.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link to="/login" className="text-green-600 hover:text-green-700 transition-colors font-medium flex items-center justify-center">
                    <ArrowLeft size={16} className="mr-1" />
                    Return to Login
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSubmitted && (
            <motion.div 
              className="mt-8 text-center text-gray-600 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Link to="/login" className="text-green-600 hover:text-green-700 hover:underline transition-colors font-medium flex items-center justify-center">
                <ArrowLeft size={16} className="mr-1.5" />
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