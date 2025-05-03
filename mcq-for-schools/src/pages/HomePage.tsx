import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Brain, Sparkles, Clock, CheckCircle, ChevronRight, Menu, X, User, LogOut, FileText, Video, PenTool, Camera, Scan, Play } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Check for auth token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
    
    // Add scroll event listener to detect when user scrolls down
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };
  
  // Testimonials data
  const testimonials = [
    {
      text: "MCQGen has saved me countless hours of work. I can now create custom MCQs and scan completed answer sheets without manual grading. The accuracy is remarkable!",
      name: "Dr. Sarah Johnson",
      title: "Biology Professor",
      initials: "SJ"
    },
    {
      text: "The automated scanning system has transformed our assessment workflow. I can scan and grade 30 test papers in minutes instead of hours, and students get their results faster.",
      name: "Michael Chen",
      title: "Computer Science Teacher",
      initials: "MC"
    },
    {
      text: "We've implemented MCQGen across our entire school district. Teachers create MCQs, distribute tests, and scan results - all in one platform. Our assessment process has never been more efficient.",
      name: "Lisa Rodriguez",
      title: "Education Director",
      initials: "LR"
    }
  ];
  
  // Features data
  const features = [
    {
      icon: FileText,
      title: "AI-Powered MCQ Generator",
      description: "Generate high-quality multiple-choice questions from any text material. Perfect for creating customized tests and assessments in minutes.",
      link: "/mcq-generator",
      color: "blue"
    },
    {
      icon: Camera,
      title: "Answer Sheet Scanner",
      description: "Use your device camera to scan and automatically grade student answer sheets. Eliminate manual grading and reduce errors.",
      link: "/test-checking",
      color: "pink"
    },
    {
      icon: BarChart,
      title: "Student Performance Analytics",
      description: "Track individual and class performance with detailed analytics. Identify knowledge gaps and improve teaching strategies.",
      link: "/analytics",
      color: "green"
    }
  ];
  
  // AI features data
  const aiFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Accuracy",
      description: "Our AI algorithms ensure each question is academically relevant with properly balanced answer choices and distractors."
    },
    {
      icon: CheckCircle,
      title: "Advanced OMR Scanning",
      description: "Our camera-based OMR technology can accurately identify marked answers even in imperfect scanning conditions."
    },
    {
      icon: Clock,
      title: "Lightning Fast Grading",
      description: "Grade batches of answer sheets in seconds, with automatic scoring and result compilation for entire classes."
    },
    {
      icon: User,
      title: "Student Management",
      description: "Organize students by class and track their performance history across multiple assessments and terms."
    },
    {
      icon: Scan,
      title: "Versatile Scanning",
      description: "Scan answer sheets with your phone camera or upload digital images for automated grading and analysis."
    },
    {
      icon: Sparkles,
      title: "Deep Performance Insights",
      description: "Analyze class performance, question difficulty, and individual student progress to improve learning outcomes."
    }
  ];
  
  // Stats data
  const stats = [
    {
      value: "98%",
      label: "Scanning accuracy"
    },
    {
      value: "500+",
      label: "Schools using MCQGen"
    },
    {
      value: "50K+",
      label: "Tests scanned monthly"
    },
    {
      value: "4.9/5",
      label: "Teacher satisfaction"
    }
  ];
  
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" className="flex items-center">
              <div className="flex items-center">
                {/* Logo container with purple background */}
                <div className="relative bg-[#6E47D0] rounded-xl p-2 w-12 h-12 flex items-center justify-center shadow-md">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                
                {/* Text part of the logo */}
                <div className="ml-3 flex flex-col">
                  <div className="flex items-center">
                    <span className="text-xl font-extrabold tracking-tight text-[#2C2A3C] uppercase">
                      MCQGEN
                    </span>
                    <span className="text-yellow-400 ml-1 flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 font-medium -mt-1">
                    AI-Powered Quiz Platform
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: "Features", href: "#features" },
              { name: "How It Works", href: "#how-it-works" },
              { name: "Pricing", href: "#pricing" },
              { name: "Testimonials", href: "#testimonials" }
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={item.href}
                  className="relative mx-3 px-2 py-5 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
                >
                  {item.name}
                  <span className="absolute inset-x-0 bottom-2.5 h-0.5 scale-x-0 rounded-full bg-purple-600 transition-transform group-hover:scale-x-100" />
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="hidden sm:block"
                >
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-purple-600 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Log in
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="hidden sm:block"
                >
                  <Link
                    to="/register"
                    className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </>
            )}

            {/* Mobile menu button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="md:hidden p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden border-t py-4 px-6 bg-white/95 backdrop-blur-md shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col space-y-4">
              <Link
                to="#features"
                className="text-base font-medium text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="#how-it-works"
                className="text-base font-medium text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="#pricing"
                className="text-base font-medium text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="#testimonials"
                className="text-base font-medium text-gray-700 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <div className="pt-4 flex flex-col space-y-3 border-t border-gray-100">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-base font-medium flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-base font-medium text-gray-700 hover:text-purple-600 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-base font-medium text-gray-700 hover:text-purple-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg text-white text-base font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[10%] -left-[15%] w-[70%] h-[70%] bg-gradient-to-br from-purple-200/70 to-blue-100/70 rounded-full blur-[120px] opacity-60 animate-blob"></div>
            <div className="absolute -bottom-[10%] -right-[15%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-100/70 to-pink-100/70 rounded-full blur-[120px] opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] bg-gradient-to-br from-blue-100/70 to-purple-100/70 rounded-full blur-[120px] opacity-40 animate-blob animation-delay-4000"></div>
            
            {/* Floating elements */}
            <div className="absolute top-[15%] left-[15%] w-8 h-8 bg-purple-300 rounded-full opacity-30 animate-float"></div>
            <div className="absolute bottom-[20%] left-[35%] w-6 h-6 bg-blue-300 rounded-full opacity-30 animate-float animation-delay-2000"></div>
            <div className="absolute top-[35%] right-[15%] w-10 h-10 bg-pink-300 rounded-full opacity-30 animate-float animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 lg:py-32">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left column - Text content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <motion.div 
                  className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 mb-8 relative overflow-hidden group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-200 to-purple-100 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                  <Sparkles className="mr-2 h-4 w-4 text-purple-800 relative z-10" />
                  <span className="text-sm font-semibold text-purple-800 relative z-10">Computer Vision-Powered Testing</span>
                </motion.div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-tight">
                  <motion.span 
                    className="text-gray-900 block mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Create & Grade MCQ Tests with
                  </motion.span>
                  <motion.span 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 inline-block relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Computer Vision
                    <svg className="absolute -bottom-2 left-0 w-full" height="10" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 5C50 5 50 0 100 0S150 5 200 5s50-5 100-5 50 5 100 5 50-5 100-5 50 5 100 5" stroke="rgb(126, 34, 206)" strokeWidth="4" fill="none" strokeLinecap="round"></path>
                    </svg>
                  </motion.span>
                </h1>
                
                <motion.p 
                  className="text-lg text-gray-600 mb-10 leading-relaxed max-w-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Revolutionize your assessment process with advanced computer vision technology. Generate high-quality MCQs, print customized answer sheets, and scan them instantly with your smartphone camera.
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap items-center gap-4 mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="bg-white border border-gray-100 shadow-md px-5 py-3 rounded-full text-sm text-gray-700 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span><span className="font-bold text-purple-600">98%</span> Scanning Accuracy</span>
                  </div>
                  <div className="bg-white border border-gray-100 shadow-md px-5 py-3 rounded-full text-sm text-gray-700 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span><span className="font-bold text-purple-600">60%</span> Time Saved</span>
                  </div>
                </motion.div>
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Link
                      to="/register"
                      className="h-14 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 transition-all duration-200"
                    >
                      Start Free Trial
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Link
                      to="#how-it-works"
                      className="h-14 px-8 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 flex items-center justify-center rounded-xl font-medium transition-all duration-200"
                    >
                      Watch Demo <Play className="ml-2 h-4 w-4 fill-current" />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
              
              {/* Right column - Hero image with 3D effect */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                className="relative"
              >
                <div className="relative z-10 transform transition-all duration-500 hover:rotate-1 hover:scale-105">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-sm opacity-40"></div>
                  <div className="relative bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden">
                    <img 
                      src="https://ucarecdn.com/0457192e-99b1-4a65-b5f8-7e1605396e2a/-/preview/1000x704/" 
                      alt="MCQGen Dashboard" 
                      className="w-full h-auto"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        e.currentTarget.src = "https://placehold.co/800x600/f5f3ff/8b5cf6?text=Computer+Vision+MCQ+Platform";
                      }}
                    />
                    
                    {/* Floating UI elements */}
                    <motion.div 
                      className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-100 flex items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Results Processed</p>
                        <p className="text-xs text-gray-500">30 tests • 98% accuracy</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <div className="flex items-center gap-3">
                        <Camera className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium">Scan more answer sheets</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl z-0"></div>
                <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl z-0"></div>
                <div className="absolute right-1/4 -bottom-6 w-12 h-12 bg-purple-400/20 rounded-full blur-xl z-0"></div>
              </motion.div>
            </div>
            
            {/* Trusted by logos */}
            <motion.div 
              className="mt-20 pt-10 border-t border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              <p className="text-center text-sm font-medium text-gray-500 mb-8">TRUSTED BY EDUCATIONAL INSTITUTIONS WORLDWIDE</p>
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
                {/* These would be replaced with actual logos */}
                <div className="h-12 w-auto text-gray-400 flex items-center">
                  <div className="bg-gray-100 px-6 py-3 rounded-lg">UNIVERSITY LOGO</div>
                </div>
                <div className="h-12 w-auto text-gray-400 flex items-center">
                  <div className="bg-gray-100 px-6 py-3 rounded-lg">ACADEMY LOGO</div>
                </div>
                <div className="h-12 w-auto text-gray-400 flex items-center">
                  <div className="bg-gray-100 px-6 py-3 rounded-lg">SCHOOL DISTRICT LOGO</div>
                </div>
                <div className="h-12 w-auto text-gray-400 flex items-center">
                  <div className="bg-gray-100 px-6 py-3 rounded-lg">EDUCATION LOGO</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Create Quiz Section */}
        <section className="py-20 bg-gradient-to-b from-white to-purple-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-purple-100 px-4 py-1.5 mb-4">
                <span className="text-sm font-semibold text-purple-800">ALL-IN-ONE PLATFORM</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Assessment Solution with <br/><span className="text-purple-600 relative">
                Computer Vision
                <svg className="absolute -bottom-2 left-0 w-full" height="7" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 3C50 3 50 0 100 0S150 3 200 3s50-3 100-3 50 3 100 3 50-3 100-3 50 3 100 3" stroke="rgb(192, 132, 252)" strokeWidth="3" fill="none" strokeLinecap="round"></path>
                </svg>
              </span></h2>
              <p className="text-gray-600 max-w-2xl mx-auto mt-4">
                From creating questions to grading papers, our platform handles the entire assessment workflow so teachers can focus on teaching.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-8 border border-gray-100 
                    shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]
                    hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] 
                    transition-all duration-300
                    hover:scale-[1.02]"
                >
                  <div className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center 
                    ${feature.color === "blue" ? "bg-blue-100 text-blue-600" : 
                      feature.color === "pink" ? "bg-pink-100 text-pink-600" : 
                      "bg-green-100 text-green-600"}`}
                  >
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-5">{feature.description}</p>
                  <Link 
                    to={feature.link}
                    className={`text-sm font-medium flex items-center gap-1.5 group
                      ${feature.color === "blue" ? "text-blue-600" : 
                        feature.color === "pink" ? "text-pink-600" : 
                        "text-green-600"}`}
                  >
                    Try Now <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Transform Your Teaching Experience Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-4 py-1.5 mb-4">
                <span className="text-sm font-semibold text-yellow-800">FOR EDUCATORS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform Your <span className="text-purple-600">Assessment Process</span></h2>
              <p className="text-gray-600 max-w-2xl mx-auto mt-4">
                Our computer vision platform eliminates manual test creation and grading, saving educators hours of work every week.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {aiFeatures.slice(0, 6).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 hover:bg-white border border-gray-100 rounded-xl p-6 
                    transition-all duration-300 hover:shadow-md group"
                >
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center 
                      text-purple-600 flex-shrink-0 transition-all duration-300
                      group-hover:bg-purple-600 group-hover:text-white">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Added demo CTA */}
            <div className="mt-16 text-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-block"
              >
                <Link
                  to="#demo"
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-full font-medium transition-colors"
                >
                  See how it works <Play className="h-4 w-4 fill-current" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-purple-50 to-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute right-1/4 top-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Trusted by <span className="text-purple-600">Leading Educators</span></h2>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                Join hundreds of schools and universities already using our platform
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col items-center"
                >
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white" id="testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-100 px-4 py-1.5 mb-4">
                <span className="text-sm font-semibold text-blue-800">SUCCESS STORIES</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our <span className="text-purple-600">Users Say</span></h2>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                Discover how educators are transforming their assessment processes with our platform
              </p>
            </div>
            
            {/* Testimonial Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative"
                >
                  {/* Quote mark decoration */}
                  <div className="absolute -top-4 -left-2 text-purple-100 text-7xl font-serif">"</div>
                  
                  <div className="relative z-10">
                    <div className="flex mb-6">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-gray-700 mb-6 relative z-10">
                      "{testimonial.text}"
                    </p>
                    
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.title}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Pagination Dots */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-purple-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-gradient-to-b from-white to-purple-50/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center rounded-full bg-purple-100 px-4 py-1.5 mb-4">
                <span className="text-sm font-semibold text-purple-800">COMMON QUESTIONS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked <span className="text-purple-600">Questions</span></h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Find answers to the most common questions about our computer vision platform
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-5">
                {[
                  {
                    question: "How does the MCQ generation work?",
                    answer: "Our advanced computer vision and AI algorithms analyze your topic or syllabus and generate curriculum-aligned multiple-choice questions with correct answers and plausible distractors. You can customize the difficulty level, number of questions, and specific topics."
                  },
                  {
                    question: "What do I need to scan answer sheets?",
                    answer: "Just a smartphone with a camera or a computer with a webcam. Our computer vision technology can scan answer sheets in various lighting conditions with 98% accuracy, even with imperfect bubbling."
                  },
                  {
                    question: "Can I customize the answer sheet format?",
                    answer: "Yes, you can create custom templates with your school logo, question count, and other parameters to match your assessment needs. Our platform generates printable PDFs that work seamlessly with our scanning technology."
                  },
                  {
                    question: "How accurate is the automated grading?",
                    answer: "Our computer vision technology achieves 98% accuracy in identifying marked answers, even with imperfect bubbling or lighting conditions. The system can also detect and flag potentially ambiguous markings for your review."
                  },
                  {
                    question: "Can I manage multiple classes?",
                    answer: "Yes, you can create unlimited classes, add students, assign tests, and track performance across all your classes from one dashboard. The platform provides detailed analytics for individual students and entire classes."
                  },
                  {
                    question: "Is there a limit to how many tests I can scan?",
                    answer: "Our basic plan includes 200 scans per month. Professional and institutional plans include unlimited scanning and additional analytics features."
                  }
                ].map((faq, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center cursor-pointer mb-4">
                      <h3 className="font-medium text-lg">{faq.question}</h3>
                      <ChevronRight className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="text-gray-600 border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <Link
                  to="/faq"
                  className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700"
                >
                  View all FAQs <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-purple-600 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -left-40 -bottom-40 w-80 h-80 rounded-full bg-purple-500 mix-blend-multiply opacity-70"></div>
            <div className="absolute right-0 top-10 w-72 h-72 rounded-full bg-purple-400 mix-blend-multiply opacity-70"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center rounded-full bg-white/20 px-4 py-1.5 mb-6">
                <span className="text-sm font-semibold text-white">GET STARTED TODAY</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Transform Your Assessment Process with Computer Vision</h2>
              <p className="text-purple-100 mb-10 text-lg max-w-2xl mx-auto">
                Join hundreds of educational institutions already saving thousands of hours with our MCQ creation and answer sheet scanning platform
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/register"
                    className="h-12 px-8 bg-white text-purple-600 hover:bg-purple-50 font-medium rounded-lg flex items-center justify-center shadow-lg transition-all duration-200"
                  >
                    Start Free Trial
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/demo"
                    className="h-12 px-8 border border-white/30 text-white hover:bg-white/10 flex items-center justify-center rounded-lg font-medium transition-all duration-200"
                  >
                    Schedule Demo <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
              
              <p className="text-purple-200 text-sm">No credit card required. 14-day free trial.</p>
            </motion.div>
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Upper footer */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 px-4 sm:px-6 lg:px-8 py-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-purple-600/20 blur-sm"></div>
                  <Brain className="relative h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xl font-bold text-purple-600">
                  MCQGen
                </span>
              </div>
              <p className="text-gray-500 mb-6 max-w-xs">
                Revolutionary computer vision platform for creating, distributing, and grading MCQ assessments with unprecedented accuracy and efficiency.
              </p>
              <div className="flex gap-4">
                <Link to="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Link>
                <Link to="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.66 2.479c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Link>
                <Link to="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.486 2 2 6.486 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.514-4.486-10-10-10z"></path>
                  </svg>
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link to="#" className="hover:text-purple-600 transition-colors">MCQ Generation</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Answer Sheet Scanning</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Performance Analytics</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Student Management</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Help Center</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Tutorial Videos</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">API Documentation</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Case Studies</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link to="#" className="hover:text-purple-600 transition-colors">About</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Careers</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-purple-600 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Lower footer */}
          <div className="border-t border-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500">© 2023 MCQGen. All rights reserved.</p>
              <div className="flex gap-6">
                <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Privacy</Link>
                <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Terms</Link>
                <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}