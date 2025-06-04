import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

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
              Welcome Back
            </motion.h2>
            <motion.p 
              className="opacity-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Log in to continue your journey with GigPanda.
            </motion.p>
            
            <motion.div
              className="mt-8 flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {/* Feature highlights */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span className="text-sm">Find your next project</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <span className="text-sm">Manage active contracts</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                    <rect x="9" y="9" width="12" height="10" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span className="text-sm">Access secure payments</span>
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
              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100"
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
              className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email Input */}
            <motion.div 
              className="mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
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
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  className="w-full px-4 py-3 text-gray-700 outline-none"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-green-600 hover:text-green-700 hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div 
                className={`flex border ${activeField === 'password' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300'} rounded-lg overflow-hidden transition-all duration-200`}
              >
                <div className={`flex items-center justify-center w-12 bg-gray-50 ${activeField === 'password' ? 'text-green-600' : 'text-gray-400'}`}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveField('password')}
                  onBlur={() => setActiveField(null)}
                  className="flex-1 px-4 py-3 text-gray-700 outline-none"
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
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <motion.div 
                    className="flex items-center"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    Sign In
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
              Don't have an account?{" "}
              <motion.span whileHover={{ x: 2 }} display="inline-block">
                <Link to="/signup" className="text-green-600 font-medium hover:underline">
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