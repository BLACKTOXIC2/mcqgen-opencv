import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Camera, BarChart, ArrowRight, CheckCircle, Brain, Clock, Lightbulb,
  Book, Upload, Zap, PieChart, Smartphone, RotateCw, SkipForward
} from 'lucide-react';

export default function HowItWorksPage() {
  // Step-by-step process data
  const steps = [
    {
      icon: Book,
      title: "Upload Your Content",
      description: "Start by uploading your teaching materials - textbook chapters, lecture notes, or custom content. Our AI engine analyzes your material to understand context and educational objectives.",
      color: "blue"
    },
    {
      icon: Brain,
      title: "AI Question Generation",
      description: "Our advanced algorithm generates multiple-choice questions aligned with your curriculum and learning objectives, creating correct answers and plausible distractors.",
      color: "purple"
    },
    {
      icon: FileText,
      title: "Customize Test Format",
      description: "Design your assessment by selecting question types, difficulty levels, and organizing by topic. Add your school branding and format according to your requirements.",
      color: "indigo"
    },
    {
      icon: SkipForward,
      title: "Distribute to Students",
      description: "Print your customized assessment for in-class use or distribute digitally. Our system generates unique answer sheets optimized for scanning.",
      color: "sky"
    },
    {
      icon: Camera,
      title: "Scan Completed Tests",
      description: "Use your device camera to scan completed answer sheets. Our computer vision technology accurately identifies marked answers even in varying conditions.",
      color: "pink"
    },
    {
      icon: BarChart,
      title: "Review Performance Data",
      description: "Access comprehensive analytics showing individual and class performance. Identify knowledge gaps and adjust your teaching strategies accordingly.",
      color: "orange"
    }
  ];

  // Benefits data
  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce test creation and grading time by up to 80%, allowing you to focus more on teaching and less on administrative tasks."
    },
    {
      icon: Zap,
      title: "Increase Efficiency",
      description: "Streamline your entire assessment workflow from question creation to performance analysis in one integrated platform."
    },
    {
      icon: PieChart,
      title: "Improve Outcomes",
      description: "Use detailed analytics to identify learning gaps and adapt your teaching strategies for better student performance."
    },
    {
      icon: Smartphone,
      title: "Work Anywhere",
      description: "Access our platform from any device with a camera, making it easy to grade assessments from the classroom or home."
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How accurate is the answer sheet scanning?",
      answer: "Our scanning technology achieves 98%+ accuracy even in varying lighting conditions and with imperfect markings. The system is continuously learning and improving its recognition capabilities."
    },
    {
      question: "Can I customize the questions generated by the AI?",
      answer: "Absolutely! You can edit any question, answer, or distractor. You can also adjust difficulty levels, select specific topics, and customize the format to match your teaching style and curriculum requirements."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we implement enterprise-grade security measures including data encryption, secure storage, and strict access controls. We comply with educational data privacy standards and never share your content or student data with third parties."
    },
    {
      question: "How long does it take to generate questions?",
      answer: "Our AI generates questions within seconds to minutes depending on the volume of content. A typical chapter can yield dozens of quality questions in under 5 minutes."
    },
    {
      question: "Can I import my existing question bank?",
      answer: "Yes, you can import questions from various formats including Word, Excel, and common LMS exports. The system will categorize and integrate them with your AI-generated questions."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-[10%] -right-[15%] w-[40%] h-[40%] bg-gradient-to-br from-blue-100/80 to-purple-100/80 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute -bottom-[10%] -left-[15%] w-[40%] h-[40%] bg-gradient-to-br from-pink-100/80 to-indigo-100/80 rounded-full blur-[120px] opacity-60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 relative overflow-hidden">
                <Lightbulb className="mr-2 h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Simple Yet Powerful</span>
              </div>
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">MCQGen</span> Works
            </motion.h1>
            
            <motion.p
              className="text-lg text-gray-600 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover our simple yet powerful workflow that transforms how educators create, 
              distribute and grade assessments with AI and computer vision technology.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                to="/register"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 transition-all duration-300"
              >
                Try It For Free
              </Link>
              <Link
                to="/demo"
                className="px-6 py-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 flex items-center justify-center rounded-lg font-medium transition-all duration-300"
              >
                Watch Demo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Simple <span className="text-blue-600">Step-by-Step</span> Process
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Our intuitive workflow makes it easy to create, distribute, and grade assessments in minutes rather than hours
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 border border-gray-100 
                  shadow-sm hover:shadow-lg transition-all duration-300 
                  relative overflow-hidden"
              >
                {/* Step number indicator */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gray-50 rounded-full flex items-end justify-start opacity-30">
                  <span className="text-5xl font-bold text-gray-200 pl-4 pb-2">{index + 1}</span>
                </div>
                
                <div 
                  className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center 
                    ${step.color === "blue" ? "bg-blue-100 text-blue-600" : 
                      step.color === "purple" ? "bg-purple-100 text-purple-600" : 
                      step.color === "indigo" ? "bg-indigo-100 text-indigo-600" :
                      step.color === "sky" ? "bg-sky-100 text-sky-600" :
                      step.color === "pink" ? "bg-pink-100 text-pink-600" : 
                      "bg-orange-100 text-orange-600"}`}
                >
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-6 top-1/2 transform -translate-y-1/2 text-gray-300">
                    <ArrowRight className="h-12 w-12" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Demonstration Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              See <span className="text-blue-600">MCQGen</span> in Action
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Watch a quick demonstration of how our platform transforms the assessment process
            </motion.p>
          </div>
          
          <motion.div
            className="rounded-2xl overflow-hidden shadow-xl border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="relative aspect-video bg-gray-100">
              {/* Video thumbnail/placeholder - would be replaced with actual video embed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer
                  hover:bg-blue-700 transition-colors duration-300 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v14l11-7-11-7z" />
                  </svg>
                </div>
              </div>
              {/* This would be replaced with a real video component or iframe */}
              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-80"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Key <span className="text-blue-600">Benefits</span> For Educators
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Experience significant improvements in your assessment workflow and educational outcomes
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 border border-gray-100 
                  shadow-sm hover:shadow-md transition-all duration-300 
                  text-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Frequently Asked <span className="text-blue-600">Questions</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Find answers to common questions about our platform
            </motion.p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
              >
                <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -bottom-40 w-80 h-80 rounded-full bg-blue-500 mix-blend-multiply opacity-70"></div>
          <div className="absolute right-0 top-10 w-72 h-72 rounded-full bg-indigo-400 mix-blend-multiply opacity-70"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Assessment Process?</h2>
            <p className="text-blue-100 mb-10 text-lg max-w-2xl mx-auto">
              Join hundreds of educational institutions already using our platform to save time and improve assessment quality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 font-medium rounded-lg flex items-center justify-center shadow-lg transition-all duration-300"
              >
                Start Free Trial
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-3 border border-white/30 text-white hover:bg-white/10 flex items-center justify-center rounded-lg font-medium transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 