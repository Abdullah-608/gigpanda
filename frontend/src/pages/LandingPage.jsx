import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef } from "react";

const LandingPage = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="w-full bg-white text-gray-900" ref={targetRef}>
      {/* Floating Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute w-72 h-72 rounded-full bg-green-500/5 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '5%' }}
        />
        <motion.div 
          className="absolute w-96 h-96 rounded-full bg-yellow-500/5 blur-3xl"
          animate={{
            x: [0, -120, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '30%', right: '10%' }}
        />
      </div>

      {/* Navigation & Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-4 py-6 flex justify-between items-center"
      >
        <div className="flex items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            Gig<span className="text-green-600">Panda</span>🐼
          </h1>
        </div>
        <div className="flex gap-6">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#how-it-works" 
            className="text-gray-700 font-medium hover:text-green-600 transition-colors"
          >
            How it Works
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#features" 
            className="text-gray-700 font-medium hover:text-green-600 transition-colors"
          >
            Features
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="#about" 
            className="text-gray-700 font-medium hover:text-green-600 transition-colors"
          >
            About
          </motion.a>
        </div>
      </motion.div>

      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative text-center mb-28 pt-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -z-10"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg rotate-45 blur-xl opacity-20"></div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="text-6xl md:text-7xl font-bold mb-6 text-gray-800"
          >
            <span className="block">Connect With Top</span>
            <span className="relative inline-block">
              Talent
              <svg className="absolute -bottom-4 left-0 w-full h-3 text-green-500/40" viewBox="0 0 200 8">
                <path fill="currentColor" d="M0,5 C50,15 100,-5 200,5 L200,8 L0,8 L0,5"></path>
              </svg>
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            The easiest way to find freelancers or get hired for remote work.
            <span className="block mt-2 font-light text-gray-500">Join our community of professionals today.</span>
          </motion.p>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col sm:flex-row gap-5 justify-center mb-8"
          >
            <Link to="/signup">
              <motion.button
                variants={item}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: "0 0 25px rgba(76, 175, 80, 0.4)" 
                }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <motion.span 
                  className="absolute inset-0 bg-green-700 z-0"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
                />
                <span className="absolute -right-2 -top-2 w-12 h-12 bg-green-300/20 rounded-full blur-md group-hover:scale-150 transition-all duration-700"></span>
              </motion.button>
            </Link>
            
            <Link to="/login">
              <motion.button
                variants={item}
                whileHover={{ 
                  scale: 1.05,
                  borderColor: "#4CAF50",
                  color: "#4CAF50",
                  boxShadow: "0 0 15px rgba(76, 175, 80, 0.15)"  
                }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-full transition-all duration-300"
              >
                Sign In
              </motion.button>
            </Link>
          </motion.div>
          
          {/* Floating Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex justify-center gap-4 mt-12 flex-wrap"
          >
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(76, 175, 80, 0.25)" }}
              className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="text-sm text-gray-700">Secure Payments</span>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(76, 175, 80, 0.25)" }}
              className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="text-sm text-gray-700">Verified Talent</span>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(76, 175, 80, 0.25)" }}
              className="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span className="text-sm text-gray-700">24/7 Support</span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          id="how-it-works"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-28"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-gray-800">
            <span>How <span className="text-green-600">GigPanda</span> Works</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 hidden md:block"></div>
            
            {/* Step 1 */}
            <motion.div
              whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="flex flex-col items-center text-center relative rounded-2xl bg-white border border-gray-100 p-8 shadow-md"
            >
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 z-10"
              >
                <span className="text-white text-2xl font-bold">1</span>
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-800">Create Your Profile</h3>
              <p className="text-gray-600">Build your professional profile showcasing your skills, experience and portfolio to stand out.</p>
              
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="mt-6 w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div
              whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="flex flex-col items-center text-center relative rounded-2xl bg-white border border-gray-100 p-8 shadow-md md:mt-8"
            >
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 z-10"
              >
                <span className="text-white text-2xl font-bold">2</span>
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-800">Connect & Apply</h3>
              <p className="text-gray-600">Browse through projects or post your own. Connect with clients or freelancers that match your needs.</p>
              
              <motion.div
                whileHover={{ rotate: -5, scale: 1.05 }}
                className="mt-6 w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div
              whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="flex flex-col items-center text-center relative rounded-2xl bg-white border border-gray-100 p-8 shadow-md"
            >
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 z-10"
              >
                <span className="text-white text-2xl font-bold">3</span>
              </motion.div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-800">Get Paid Securely</h3>
              <p className="text-gray-600">Complete work and receive payment through our secure escrow system that protects both parties.</p>
              
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="mt-6 w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          id="features"
          style={{ opacity, scale }}
          className="mb-28"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-gray-800">
            <span>Why Choose <span className="text-green-600">GigPanda</span></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ 
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(76, 175, 80, 0.15)"
              }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-md group transition-all duration-300"
            >
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:shadow-green-500/30 transition-shadow duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-green-600 transition-colors duration-300">Find Work</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Browse thousands of freelance opportunities and secure your next project with ease.</p>
              
              <motion.div 
                className="mt-6 pt-6 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: "auto" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Project-based work</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Hourly contracts</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Long-term opportunities</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            <motion.div 
              whileHover={{ 
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(76, 175, 80, 0.15)"
              }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-md group transition-all duration-300"
            >
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:shadow-green-500/30 transition-shadow duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-green-600 transition-colors duration-300">Hire Talent</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Post a job and find the perfect freelancer for your business needs, vetted and ready.</p>
              
              <motion.div 
                className="mt-6 pt-6 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: "auto" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Verified professionals</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Skill-based matching</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Transparent ratings</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            <motion.div 
              whileHover={{ 
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(76, 175, 80, 0.15)"
              }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-md group transition-all duration-300"
            >
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 shadow-md group-hover:shadow-green-500/30 transition-shadow duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-green-600 transition-colors duration-300">Secure Payments</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">Our escrow system ensures you only pay for work you're satisfied with, every time.</p>
              
              <motion.div 
                className="mt-6 pt-6 border-t border-gray-200"
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: "auto" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Milestone payments</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Secure escrow</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    <span>Dispute resolution</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* About Us Section */}
        <motion.div
          id="about"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-28"
        >
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gray-100 opacity-70 z-0">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="bamboo" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4CAF50" strokeWidth="0.5" strokeOpacity="0.2"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#bamboo)" />
              </svg>
            </div>
            
            
            
            <div className="relative z-10 p-12 md:p-16">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-bold mb-6 text-gray-800"
                  >
                    About <span className="text-green-600">GigPanda</span>
                  </motion.h2>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      We're building the future of work. Our platform connects talented freelancers with businesses looking for specialized skills in a seamless, secure environment.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      With a focus on quality and security, we ensure that both clients and freelancers have the best possible experience, fostering long-term professional relationships.
                    </p>
                    
                    <ul className="mt-8 space-y-3">
                      <li className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-gray-700">Global talent marketplace</span>
                      </li>
                      
                      <li className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-gray-700">Smart skill matching</span>
                      </li>
                      
                      <li className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-gray-700">Industry-leading security</span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
                
              
                
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials/Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-28"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-gray-800">
            Trusted by <span className="text-green-600">Thousands</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
              className="bg-white border border-gray-100 p-8 rounded-2xl shadow-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0 transform origin-left group-hover:scale-x-100 transition-transform duration-500"></div>
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <p className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">10K+</p>
                <p className="text-xl text-gray-500 font-light">Talented Freelancers</p>
              </motion.div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
              className="bg-white border border-gray-100 p-8 rounded-2xl shadow-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0 transform origin-left group-hover:scale-x-100 transition-transform duration-500"></div>
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.3
                }}
              >
                <p className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">5K+</p>
                <p className="text-xl text-gray-500 font-light">Satisfied Clients</p>
              </motion.div>
            </motion.div>
            
            <motion.div
              whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
              className="bg-white border border-gray-100 p-8 rounded-2xl shadow-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0 transform origin-left group-hover:scale-x-100 transition-transform duration-500"></div>
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.6
                }}
              >
                <p className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">20K+</p>
                <p className="text-xl text-gray-500 font-light">Projects Completed</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="rounded-3xl overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gray-100 z-0">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="bamboo-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4CAF50" strokeWidth="0.5" strokeOpacity="0.1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#bamboo-pattern)" />
              </svg>
            </div>
            
            <div className="relative z-10 p-12 md:p-16 text-center">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-6 text-gray-800"
              >
                Ready to Transform Your <span className="text-green-600">Career</span>?
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto"
              >
                Join thousands of freelancers and businesses already using GigPanda to connect, collaborate, and grow.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-5 justify-center"
              >
                <Link to="/signup">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 0 25px rgba(76, 175, 80, 0.4)" 
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg"
                  >
                    Get Started For Free
                  </motion.button>
                </Link>
                
                <Link to="/how-it-works">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-4 bg-white text-gray-800 border border-gray-300 font-bold rounded-full flex items-center justify-center gap-2 group"
                  >
                    <span>Learn More</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 transform group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

     
    </div>
  );
};

export default LandingPage;