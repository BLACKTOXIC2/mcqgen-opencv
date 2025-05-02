import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Brain, Sparkles, Clock, CheckCircle, ChevronRight, Menu, X, User, LogOut, FileText, Video, PenTool, Camera, Scan } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check for auth token in localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
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

      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-purple-600/20 blur-sm"></div>
              <Brain className="relative h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xl font-bold text-purple-600">
              MCQGen
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link to="#features" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
              Features
            </Link>
            <Link
              to="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
            >
              How It Works
            </Link>
            <Link to="#pricing" className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors">
              Pricing
            </Link>
            <Link
              to="#testimonials"
              className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
            >
              Testimonials
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-2 bg-purple-600 hover:bg-purple-700 shadow-md px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:flex bg-purple-600 hover:bg-purple-700 shadow-md px-4 py-2 rounded-md text-white text-sm font-medium"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 px-6 bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              <Link
                to="#features"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="#how-it-works"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="#pricing"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="#testimonials"
                className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </Link>
              <div className="pt-2 flex flex-col space-y-3">
                {isLoggedIn ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2"
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
                      className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-white text-sm font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-12 pb-16 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-purple-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-60"></div>
            <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-60"></div>
            <div className="absolute top-[20%] right-[25%] w-[15%] h-[30%] bg-pink-100 rounded-full mix-blend-multiply filter blur-[60px] opacity-60"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-6">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                <span>AI-Powered MCQ Platform for Schools</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Create & Grade <span className="text-blue-600">MCQ Tests</span> in Minutes
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Generate high-quality multiple-choice questions and automatically grade answer sheets using advanced AI technology designed specifically for educational assessment.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <div className="bg-purple-50 px-4 py-2 rounded-full text-sm text-gray-700">
                  <span className="font-bold text-purple-600">98%</span> Scanning Accuracy
                </div>
                <div className="bg-purple-50 px-4 py-2 rounded-full text-sm text-gray-700">
                  <span className="font-bold text-purple-600">500+</span> Schools
                </div>
                <div className="bg-purple-50 px-4 py-2 rounded-full text-sm text-gray-700">
                  <span className="font-bold text-purple-600">50K+</span> Tests Monthly
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20 transition-all duration-300"
                  >
                    Start Creating Tests
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="#how-it-works"
                    className="h-12 px-8 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 flex items-center justify-center rounded-lg font-medium transition-all duration-300"
                  >
                    Watch Demo <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Create Quiz Section */}
        <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-purple-100 p-1 px-3 mb-4">
                <span className="text-sm font-medium text-purple-800">ALL-IN-ONE SOLUTION</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Complete Assessment Platform with <span className="text-purple-600">AI Power</span></h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
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
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center 
                    ${feature.color === "blue" ? "bg-blue-100 text-blue-600" : 
                      feature.color === "pink" ? "bg-pink-100 text-pink-600" : 
                      "bg-green-100 text-green-600"}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{feature.description}</p>
                  <Link 
                    to={feature.link}
                    className={`text-sm font-medium flex items-center 
                      ${feature.color === "blue" ? "text-blue-600" : 
                        feature.color === "pink" ? "text-pink-600" : 
                        "text-green-600"}`}
                  >
                    Try Now <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Transform Your Teaching Experience Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-yellow-100 p-1 px-3 mb-4">
                <span className="text-sm font-medium text-yellow-800">FOR EDUCATORS</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Transform Your <span className="text-purple-600">Assessment Process</span></h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our AI-powered platform eliminates manual test creation and grading, saving educators hours of work every week.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {aiFeatures.slice(0, 6).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gradient-to-r from-white to-purple-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Trusted by <span className="text-purple-600">Educational Institutions</span></h2>
              <p className="text-gray-600 mt-2">
                Join hundreds of schools and universities already using our platform to transform assessment
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="font-bold">TRUSTED BY</div>
                <div className="text-lg font-bold text-purple-600">500+ Schools</div>
              </div>
              <div className="text-center">
                <div className="font-bold">AVERAGE RATING</div>
                <div className="text-lg font-bold text-purple-600">4.9 /5.0</div>
              </div>
              <div className="text-center">
                <div className="font-bold">TESTS PROCESSED</div>
                <div className="text-lg font-bold text-purple-600">1M+</div>
              </div>
            </div>
            
            {/* Testimonial Slider */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow max-w-2xl mx-auto">
              <div className="flex items-start">
                <div className="mr-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    RJ
                  </div>
                </div>
                <div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-2">
                    "MCQGen has eliminated our paper-based testing workflow. I can create tests, print them, and then scan completed answer sheets directly with my phone. Grading that used to take hours now takes minutes."
                  </p>
                  <p className="font-bold">Richard Jones</p>
                  <p className="text-sm text-gray-600">Science Teacher, Kennedy Academy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gradient-to-b from-white to-purple-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center rounded-full bg-purple-100 p-1 px-3 mb-4">
                <span className="text-sm font-medium text-purple-800">SUPPORT</span>
              </div>
              <h2 className="text-3xl font-bold">Frequently Asked <span className="text-purple-600">Questions</span></h2>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                Get instant answers to common questions about our MCQ generation and test scanning platform
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {[
                  {
                    question: "How does the MCQ generation work?",
                    answer: "Our AI analyzes your topic or syllabus and generates curriculum-aligned multiple-choice questions with correct answers and plausible distractors."
                  },
                  {
                    question: "What do I need to scan answer sheets?",
                    answer: "Just a smartphone with a camera or a computer with a webcam. Our app can scan answer sheets in various lighting conditions."
                  },
                  {
                    question: "Can I customize the answer sheet format?",
                    answer: "Yes, you can create custom templates with your school logo, question count, and other parameters to match your assessment needs."
                  },
                  {
                    question: "How accurate is the automated grading?",
                    answer: "Our scanning technology achieves 98% accuracy in identifying marked answers, even with imperfect bubbling or lighting conditions."
                  },
                  {
                    question: "Can I manage multiple classes?",
                    answer: "Yes, you can create unlimited classes, add students, assign tests, and track performance across all your classes from one dashboard."
                  },
                  {
                    question: "Is there a limit to how many tests I can scan?",
                    answer: "Our basic plan includes 100 scans per month. Professional and institutional plans include unlimited scanning."
                  }
                ].map((faq, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-lg p-4 bg-white"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{faq.question}</h3>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-white/20 p-1 px-3 mb-4">
              <span className="text-sm font-medium text-white">GET STARTED</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Modernize Your Assessment Process</h2>
            <p className="text-purple-100 mb-8 max-w-xl mx-auto">
              Join hundreds of educational institutions already saving thousands of hours with our MCQ creation and answer sheet scanning platform
            </p>
            <Link
              to="/register"
              className="inline-block h-12 px-8 bg-white text-purple-600 hover:bg-purple-50 font-medium rounded-lg flex items-center mx-auto justify-center shadow-lg transition-all duration-300"
            >
              Sign Up For Free <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="w-full border-t py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-lg font-bold text-purple-600">
                  MCQGen
                </span>
              </div>
              <p className="text-sm text-gray-500">
                AI-powered MCQ generation and answer sheet scanning platform for educational institutions.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="#">MCQ Generation</Link></li>
                <li><Link to="#">Answer Sheet Scanning</Link></li>
                <li><Link to="#">Performance Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="#">Help Center</Link></li>
                <li><Link to="#">Tutorial Videos</Link></li>
                <li><Link to="#">Case Studies</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="#">About</Link></li>
                <li><Link to="#">Pricing</Link></li>
                <li><Link to="#">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex justify-between items-center">
            <p className="text-sm text-gray-500">© 2023 MCQGen. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="#" className="text-gray-400 hover:text-purple-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
              <Link to="#" className="text-gray-400 hover:text-purple-600">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.66 2.479c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}