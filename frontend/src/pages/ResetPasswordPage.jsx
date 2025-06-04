import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, ArrowRight, Loader } from "lucide-react";
import toast from "react-hot-toast";

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
              Secure Your Account
            </motion.h2>
            <motion.p 
              className="opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Set a strong password to protect your GigPanda account.
            </motion.p>
            
            <motion.div
              className="mt-8 flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Security tips */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Check size={16} />
                </div>
                <span className="text-sm">Use at least 8 characters</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Check size={16} />
                </div>
                <span className="text-sm">Include numbers and symbols</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Check size={16} />
                </div>
                <span className="text-sm">Avoid using common words</span>
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
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              className="text-2xl font-bold text-gray-900"
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
              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100"
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
                className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md"
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
                className="mb-6 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-md"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            {/* New Password Input */}
            <motion.div 
              className="mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div 
                className={`flex border ${activeField === 'password' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'} rounded-lg overflow-hidden transition-all duration-200`}
              >
                <div className={`flex items-center justify-center w-12 bg-gray-50 ${activeField === 'password' ? 'text-green-600' : 'text-gray-400'}`}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  className="flex-1 px-4 py-3 text-gray-700 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password Input */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div 
                className={`flex border ${activeField === 'confirm' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'} rounded-lg overflow-hidden transition-all duration-200`}
              >
                <div className={`flex items-center justify-center w-12 bg-gray-50 ${activeField === 'confirm' ? 'text-green-600' : 'text-gray-400'}`}>
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setActiveField('confirm')}
                  onBlur={() => setActiveField(null)}
                  className="flex-1 px-4 py-3 text-gray-700 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="px-4 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
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
                className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-600">Password requirements</span>
                    <span className={`text-xs font-medium ${
                      percentComplete < 50 ? 'text-red-500' : 
                      percentComplete < 100 ? 'text-yellow-500' : 
                      'text-green-500'
                    }`}>
                      {percentComplete < 50 ? 'Incomplete' : 
                       percentComplete < 100 ? 'Almost there' : 
                       'Complete'}
                    </span>
                  </div>
                  
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${
                        percentComplete < 50 ? 'bg-red-500' : 
                        percentComplete < 100 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentComplete}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {requirements.map((req) => (
                    <div key={req.id} className="flex items-center">
                      <motion.div 
                        initial={{ scale: 0.5 }}
                        animate={{ 
                          scale: req.validate(password) ? 1 : 0.5,
                          backgroundColor: req.validate(password) ? '#10B981' : '#D1D5DB',
                        }}
                        className="w-3 h-3 rounded-full mr-2 flex items-center justify-center"
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
                      <span className={`text-xs ${req.validate(password) ? 'text-gray-700' : 'text-gray-500'}`}>
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
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    Set New Password
                    <ArrowRight size={16} className="ml-1.5" />
                  </motion.div>
                )}
              </span>
            </motion.button>

            <motion.div 
              className="mt-6 text-center text-gray-600 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              Remember your password?{" "}
              <motion.span whileHover={{ x: 2 }} display="inline-block">
                <Link to="/login" className="text-green-600 font-medium hover:underline">
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