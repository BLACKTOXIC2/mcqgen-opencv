import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Camera, BarChart, Brain, Sparkles, Clock, CheckCircle, ChevronRight,
  PenTool, Scan, Shield, DownloadCloud, Users
} from 'lucide-react';

export default function FeaturesPage() {
  // Core Features data with more detailed descriptions
  const coreFeatures = [
    {
      icon: FileText,
      title: "AI-Powered MCQ Generator",
      description: "Our advanced AI algorithms analyze your content and generate curriculum-aligned multiple-choice questions with correct answers and plausible distractors. Customize difficulty levels, question types, and more to match your specific teaching needs.",
      color: "blue",
      link: "/mcq-generator"
    },
    {
      icon: Camera,
      title: "Answer Sheet Scanner",
      description: "Use your device camera to instantly scan and grade student answer sheets. Our computer vision technology works in various lighting conditions and can accurately identify marked answers even with imperfect bubbling, eliminating hours of manual grading.",
      color: "pink",
      link: "/test-checking"
    },
    {
      icon: BarChart,
      title: "Performance Analytics",
      description: "Gain valuable insights into student performance with detailed analytics dashboards. Track individual and class progress over time, identify knowledge gaps, and adjust your teaching strategies accordingly to improve learning outcomes.",
      color: "green",
      link: "/analytics"
    }
  ];

  // Additional features with more detailed information
  const additionalFeatures = [
    {
      icon: Users,
      title: "Student Management",
      description: "Effortlessly organize students by class, track attendance, and manage student profiles. Create custom groups for targeted assessments and personalized learning experiences."
    },
    {
      icon: PenTool,
      title: "Customizable Templates",
      description: "Design personalized answer sheets with your school logo, custom instructions, and specific formatting. Our flexible templates adapt to your exact requirements."
    },
    {
      icon: Scan,
      title: "Bulk Scanning",
      description: "Process multiple answer sheets in one go with our batch scanning feature. Save time by uploading digital images or scanning directly with your camera."
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Rest easy knowing your data is protected with enterprise-grade encryption and secure storage solutions. We comply with educational data privacy standards."
    },
    {
      icon: DownloadCloud,
      title: "Export Options",
      description: "Export results and analytics in multiple formats including PDF, Excel, and CSV for easy integration with your existing gradebook or LMS systems."
    },
    {
      icon: Brain,
      title: "Smart Question Bank",
      description: "Build your own question bank over time. The system learns from your preferences and improves question quality with each use."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-[10%] -left-[15%] w-[50%] h-[50%] bg-gradient-to-br from-purple-100/80 to-blue-100/80 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute -bottom-[10%] -right-[15%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-100/80 to-pink-100/80 rounded-full blur-[120px] opacity-60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 relative overflow-hidden">
                <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Powerful Assessment Tools</span>
              </div>
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Advanced Features for Modern 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600"> Educational Assessment</span>
            </motion.h1>
            
            <motion.p
              className="text-lg text-gray-600 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our platform combines AI-powered question generation with computer vision 
              scanning technology to revolutionize how you create, distribute, and grade assessments.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                to="/register"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg flex items-center justify-center shadow-lg shadow-purple-600/20 transition-all duration-300"
              >
                Start Free Trial
              </Link>
              <Link
                to="/how-it-works"
                className="px-6 py-3 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 flex items-center justify-center rounded-lg font-medium transition-all duration-300"
              >
                See How It Works <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Core Features That <span className="text-purple-600">Transform Assessment</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Our platform streamlines the entire assessment workflow, from creating questions to analyzing results
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {coreFeatures.map((feature, index) => (
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
                <div 
                  className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center 
                    ${feature.color === "blue" ? "bg-blue-100 text-blue-600" : 
                      feature.color === "pink" ? "bg-pink-100 text-pink-600" : 
                      "bg-green-100 text-green-600"}`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <Link 
                  to={feature.link}
                  className={`text-sm font-medium flex items-center gap-1.5 group
                    ${feature.color === "blue" ? "text-blue-600" : 
                      feature.color === "pink" ? "text-pink-600" : 
                      "text-green-600"}`}
                >
                  Learn more <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Powerful Tools for <span className="text-purple-600">Educators</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Discover additional features designed to enhance your assessment workflow
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
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
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="text-purple-600">Compare</span> Our Capabilities
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              See how MCQGen compares to traditional assessment methods
            </motion.p>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500">Feature</th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-purple-600">MCQGen</th>
                  <th scope="col" className="px-6 py-4 text-center text-sm font-medium text-gray-500">Traditional Methods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[
                  { feature: "Question Generation", mcqgen: "Automated AI-powered generation", traditional: "Manual creation" },
                  { feature: "Grading Speed", mcqgen: "Less than 1 minute per test", traditional: "15-30 minutes per test" },
                  { feature: "Accuracy", mcqgen: "98% scanning accuracy", traditional: "Human error prone" },
                  { feature: "Analytics", mcqgen: "Detailed performance insights", traditional: "Basic or manual tracking" },
                  { feature: "Time Investment", mcqgen: "Reduced by up to 80%", traditional: "Significant time required" }
                ].map((row, index) => (
                  <motion.tr 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                      <div className="flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span>{row.mcqgen}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500">{row.traditional}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -bottom-40 w-80 h-80 rounded-full bg-purple-500 mix-blend-multiply opacity-70"></div>
          <div className="absolute right-0 top-10 w-72 h-72 rounded-full bg-purple-400 mix-blend-multiply opacity-70"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Assessment Process?</h2>
            <p className="text-purple-100 mb-10 text-lg max-w-2xl mx-auto">
              Join hundreds of educational institutions already using our platform to save time and improve assessment quality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-purple-600 hover:bg-purple-50 font-medium rounded-lg flex items-center justify-center shadow-lg transition-all duration-300"
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