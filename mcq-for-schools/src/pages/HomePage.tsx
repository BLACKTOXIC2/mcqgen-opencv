import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Brain, Sparkles, Clock, CheckCircle, ChevronRight, Menu, X, User, LogOut } from 'lucide-react';
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
      text: "MCQGen has saved me countless hours of work. The AI generates questions that are relevant and challenging for my students. I've seen a 30% improvement in engagement!",
      name: "Dr. Sarah Johnson",
      title: "Biology Professor",
      initials: "SJ"
    },
    {
      text: "The performance tracking feature has given me unprecedented insights into my students' learning patterns. I can now immediately identify knowledge gaps and address them.",
      name: "Michael Chen",
      title: "Computer Science Teacher",
      initials: "MC"
    },
    {
      text: "We've implemented MCQGen across our entire school district with amazing results. Student assessment has never been more efficient and effective.",
      name: "Lisa Rodriguez",
      title: "Education Director",
      initials: "LR"
    }
  ];
  
  // Features data
  const features = [
    {
      icon: Sparkles,
      title: "AI Question Generation",
      description: "Generate high-quality MCQs from any source material with our advanced AI technology that adapts to your specific needs.",
      link: "/features/ai-generation"
    },
    {
      icon: BarChart,
      title: "Performance Analytics",
      description: "Track student progress with detailed analytics and identify knowledge gaps to better focus your teaching efforts.",
      link: "/features/analytics"
    },
    {
      icon: Clock,
      title: "Instant Assessments",
      description: "Create and distribute assessments instantly with customizable settings, saving you hours of preparation time.",
      link: "/features/assessments"
    },
    {
      icon: CheckCircle,
      title: "Smart Feedback",
      description: "Provide automated, personalized feedback to students based on their assessment performance.",
      link: "/features/feedback"
    },
    {
      icon: Brain,
      title: "Adaptive Learning",
      description: "Our system adapts to student performance, focusing on areas where they need the most improvement.",
      link: "/features/adaptive-learning"
    },
    {
      icon: ChevronRight,
      title: "Seamless Integration",
      description: "Easily integrate with your existing LMS and other educational tools with our robust API.",
      link: "/features/integration"
    }
  ];
  
  // Process steps
  const process = [
    {
      title: "Input Content",
      description: "Upload your text, select a topic, or provide a URL to source content. Our AI will analyze the material."
    },
    {
      title: "Generate Questions",
      description: "Our AI analyzes the content and generates relevant multiple-choice questions with correct answers and distractors."
    },
    {
      title: "Track Performance",
      description: "Distribute assessments to students and track their performance with our comprehensive analytics dashboard."
    }
  ];
  
  // Pricing plans
  const plans = [
    {
      name: "Basic",
      description: "For individual use",
      price: "$0",
      features: [
        "50 AI-generated questions/month",
        "Basic performance reporting",
        "1 user account",
        "Email support",
        "Export to PDF"
      ],
      buttonText: "Get Started",
      buttonLink: "/register",
      popular: false
    },
    {
      name: "Pro",
      description: "For serious educators",
      price: "$29",
      features: [
        "Unlimited AI-generated questions",
        "Advanced analytics dashboard",
        "5 user accounts",
        "Priority support",
        "Custom question templates",
        "Integrations with popular LMS",
        "CSV/Excel exports"
      ],
      buttonText: "Start Free Trial",
      buttonLink: "/register",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For educational organizations",
      price: "Custom",
      features: [
        "Unlimited AI-generated questions",
        "Advanced analytics with insights",
        "Unlimited user accounts",
        "Dedicated support manager",
        "API access",
        "Custom branding",
        "SSO authentication",
        "Advanced security features"
      ],
      buttonText: "Contact Sales",
      buttonLink: "/contact",
      popular: false
    }
  ];
  
  // FAQs data
  const faqs = [
    {
      question: "Can I try before I buy?",
      answer: "Yes! Our Basic plan is free forever, and we offer a 14-day free trial on our Pro plan with all features included."
    },
    {
      question: "How accurate are the AI-generated questions?",
      answer: "Our AI has been trained on thousands of educational materials and achieves a 98% accuracy rate for generating relevant and correctly formatted questions."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with no questions asked. Your data will remain accessible until the end of your billing period."
    },
    {
      question: "Do you offer discounts for educational institutions?",
      answer: "Yes, we offer special pricing for schools, colleges, and educational institutions. Please contact our sales team for details."
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
        <section className="relative w-full pt-24 pb-20 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-0 -left-[10%] w-[40%] h-[40%] bg-purple-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-60"></div>
            <div className="absolute bottom-0 -right-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-60"></div>
            <div className="absolute top-[20%] right-[25%] w-[15%] h-[30%] bg-pink-100 rounded-full mix-blend-multiply filter blur-[60px] opacity-60"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left content - Text */}
              <motion.div 
                className="flex-1 text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-6">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  <span>AI-Powered Education</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Generate MCQs & Track Performance with AI
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  Create high-quality multiple-choice questions instantly and analyze student performance with our advanced AI technology.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20 transition-all duration-300"
                    >
                      Get Started Free
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
                      See How it Works <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </motion.div>
                </div>
                <div className="mt-12 hidden lg:flex items-center">
                  <div className="flex -space-x-2 mr-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white overflow-hidden bg-gradient-to-br from-purple-200 to-purple-300">
                        <div className="h-full w-full object-cover flex items-center justify-center text-xs text-gray-600">
                          {i}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-purple-600">500+</span> educators already using MCQGen
                  </p>
                </div>
              </motion.div>
              
              {/* Right content - Image */}
              <motion.div 
                className="flex-1 relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 z-10"></div>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50 blur rounded-2xl"></div>
                  <img
                    src="https://images.pexels.com/photos/4144179/pexels-photo-4144179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="MCQGen Dashboard Preview"
                    className="absolute inset-0 h-full w-full object-cover rounded-2xl z-0"
                  />
                  {/* Floating elements */}
                  <div className="absolute -right-6 -bottom-6 h-24 w-24 bg-gradient-to-br from-purple-600 to-violet-800 rounded-2xl shadow-xl z-20 flex items-center justify-center text-white font-bold">
                    <div className="text-center">
                      <Sparkles className="h-6 w-6 mx-auto mb-1" />
                      <span>AI MCQ</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -left-8 bg-white rounded-xl shadow-lg p-4 z-20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">98% Accuracy</p>
                      <p className="text-xs text-gray-500">Verified Questions</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Trust badges */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-400 mb-6">TRUSTED BY LEADING INSTITUTIONS</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center opacity-50">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 w-36 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 bg-white border-y border-gray-100">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-purple-600">
                  10,000+
                </h3>
                <p className="text-sm text-gray-500">Questions</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-purple-600">
                  5M+
                </h3>
                <p className="text-sm text-gray-500">Questions Answered</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-purple-600">
                  98%
                </h3>
                <p className="text-sm text-gray-500">Accuracy Rate</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-purple-600">
                  30%
                </h3>
                <p className="text-sm text-gray-500">Time Saved</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-28 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center mb-16"
            >
              <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                <span>Features</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                Everything You Need
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl text-lg">
                Our platform combines AI-powered question generation with comprehensive analytics to transform your assessment process.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)" }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 flex flex-col h-full"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 flex-grow">{feature.description}</p>
                  <Link to={feature.link} className="text-purple-600 hover:text-purple-700 font-medium flex items-center">
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
            
            {/* Feature highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8 shadow-xl text-white overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFFFFF" d="M42.8,-67.9C55.3,-61.2,65.3,-48.9,71.5,-34.8C77.8,-20.6,80.2,-4.6,77.2,9.8C74.2,24.2,65.7,37.1,54.3,46.3C42.9,55.6,28.5,61.2,14.1,65.3C-0.3,69.3,-14.8,71.8,-30.3,68.7C-45.9,65.7,-62.5,57,-71.3,43.1C-80.1,29.3,-81.1,10.3,-77.9,-6.7C-74.7,-23.7,-67.3,-38.5,-56.2,-48.5C-45.1,-58.5,-30.4,-63.6,-15.7,-69.7C-1,-75.7,13.7,-82.7,28.2,-80.1C42.8,-77.5,57.3,-65.3,42.8,-67.9Z" transform="translate(100 100)" />
                </svg>
              </div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-2/3">
                  <h3 className="text-2xl font-bold mb-4">AI-powered question generation that adapts to your needs</h3>
                  <p className="mb-6 text-white/80">
                    Our advanced AI algorithms can generate questions from any source material, adapt to different difficulty levels, and provide instant feedback to students.
                  </p>
                  <Link to="/features" className="inline-flex items-center rounded-full bg-white text-purple-600 hover:text-purple-700 px-4 py-2 font-medium transition-colors">
                    Explore all features <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
                <div className="md:w-1/3 flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                    <Brain className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 md:py-28 bg-gray-50 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-purple-300 to-transparent left-1/2 transform -translate-x-1/2 top-1/2 opacity-70"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center mb-20"
            >
              <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                <span>Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                How MCQGen Works
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl text-lg">
                Our simple three-step process makes creating and analyzing MCQs effortless
              </p>
            </motion.div>

            <div className="relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute h-1 bg-gradient-to-r from-purple-400 to-indigo-400 top-24 left-[15%] right-[15%] rounded-full"></div>
              <div className="grid md:grid-cols-3 gap-8 md:gap-6">
                {process.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center md:items-start relative"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl mb-12 relative z-10 shadow-lg shadow-purple-600/20">
                      {index + 1}
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-full md:mt-[-2rem] relative">
                      <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                    
                    {index < process.length - 1 && (
                      <div className="hidden md:block absolute top-24 left-full transform -translate-x-1/2 translate-y-[-50%] rotate-[-30deg]">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-20 bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center rounded-full bg-purple-100 p-3 mb-6">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Ready to save hours on assessment creation?</h3>
              <p className="text-gray-600 mb-8">
                Our users report saving an average of 5 hours per week on creating and grading assessments.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  to="/register"
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg shadow-purple-600/20 transition-all duration-300"
                >
                  Get Started Today
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 md:py-28 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center mb-20"
            >
              <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                <span>Pricing</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                Choose Your Plan
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl text-lg">
                Flexible pricing options for educators, institutions, and enterprises
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.1)" }}
                  className={`rounded-2xl p-8 flex flex-col h-full shadow-lg ${
                    plan.popular ? 'bg-gradient-to-b from-white to-purple-50 border-2 border-purple-400 relative' : 'bg-white border border-gray-100'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                    <div className="flex items-baseline mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.price !== 'Custom' && <span className="text-gray-500 ml-2">/month</span>}
                    </div>
                    {plan.name === 'Basic' && (
                      <p className="text-xs text-gray-500">Free forever, no credit card required</p>
                    )}
                  </div>
                  
                  <div className="mb-8 flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to={plan.buttonLink}
                      className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition-colors ${
                        plan.popular ? 
                        'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/20' : 
                        plan.name === 'Enterprise' ? 
                        'border border-gray-200 text-gray-700 hover:bg-gray-50' :
                        'border border-purple-600 text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      {plan.buttonText}
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            {/* FAQ related to pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mt-16"
            >
              <h3 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6">
                    <h4 className="text-lg font-semibold mb-2">{faq.question}</h4>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 text-center">
                <p className="text-gray-600 mb-4">Still have questions?</p>
                <Link to="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
                  Contact our sales team →
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-purple-50/30 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-1/4 left-0 w-72 h-72 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center text-center mb-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center"
              >
                <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  <span>Testimonials</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                  What Our Users Say
                </h2>
                <p className="mt-4 text-gray-600 max-w-2xl text-lg">
                  Don't take our word for it — hear from educators who have transformed their assessment process with MCQGen.
                </p>
              </motion.div>
            </div>

            {/* Testimonial Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, boxShadow: "0 10px 40px -15px rgba(0, 0, 0, 0.1)" }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative"
                >
                  {/* Quote icon */}
                  <div className="absolute -top-5 -left-3">
                    <div className="text-purple-200 text-6xl">"</div>
                  </div>
                  
                  {/* Stars */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                  
                  {/* Testimonial text */}
                  <p className="text-gray-600 mb-6 relative z-10">
                    "{testimonial.text}"
                  </p>
                  
                  {/* User info */}
                  <div className="flex items-center mt-auto">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-indigo-600 mr-4">
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {testimonial.initials}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.title}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Featured logos */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-white p-8 shadow-lg border border-gray-100"
            >
              <p className="text-center text-gray-600 mb-8 font-medium">
                Trusted by leading educational institutions and organizations
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-8 w-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </motion.div>
            
            {/* CTA within testimonials */}
            <div className="mt-20 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <p className="text-lg text-gray-600 mb-6">
                  Join the community of educators revolutionizing assessment
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-lg shadow-purple-600/20 transition-all duration-300"
                  >
                    Start Creating MCQs Today
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-purple-600">
          <div className="container px-4 md:px-6 text-center">
            <div className="mx-auto max-w-3xl space-y-6">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Transform Your Assessments?
              </h2>
              <p className="text-xl text-purple-100">
                Join thousands of educators using MCQGen to create better assessments and track student progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/register" className="h-12 px-8 bg-white text-purple-600 hover:bg-purple-50 text-base flex items-center justify-center rounded-md font-medium">
                  Get Started Free
                </Link>
                <Link to="/demo" className="h-12 px-8 border border-white text-white hover:bg-purple-700 text-base flex items-center justify-center rounded-md font-medium">
                  Schedule a Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="w-full border-t py-12 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xl font-bold text-purple-600">
                  MCQGen
                </span>
              </div>
              <p className="text-sm text-gray-500">
                AI-powered MCQ generation and student performance tracking platform.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#features" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="#pricing" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="#testimonials" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© 2023 MCQGen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}