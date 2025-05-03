import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, MinusCircle, HelpCircle, Sparkles } from 'lucide-react';

export default function PricingPage() {
  // Pricing tiers data
  const tiers = [
    {
      name: "Free Trial",
      description: "Perfect for evaluating our platform",
      price: {
        monthly: "0",
        annually: "0"
      },
      features: [
        { text: "25 AI-generated questions per month", included: true },
        { text: "Basic answer sheet scanning", included: true },
        { text: "Basic performance analytics", included: true },
        { text: "Single administrator account", included: true },
        { text: "Email support", included: true },
        { text: "Question bank access", included: false },
        { text: "Customizable templates", included: false },
        { text: "Advanced analytics", included: false },
        { text: "Multiple admin accounts", included: false },
        { text: "Priority support", included: false }
      ],
      buttonText: "Start Free Trial",
      buttonLink: "/register",
      highlight: false,
      color: "gray"
    },
    {
      name: "Educator",
      description: "For individual teachers and tutors",
      price: {
        monthly: "29",
        annually: "290"
      },
      features: [
        { text: "Unlimited AI-generated questions", included: true },
        { text: "Advanced answer sheet scanning", included: true },
        { text: "Detailed performance analytics", included: true },
        { text: "Single administrator account", included: true },
        { text: "Priority email support", included: true },
        { text: "Access to question bank", included: true },
        { text: "5 customizable templates", included: true },
        { text: "Student performance trends", included: true },
        { text: "Multiple admin accounts", included: false },
        { text: "API access", included: false }
      ],
      buttonText: "Get Started",
      buttonLink: "/register",
      highlight: false,
      color: "indigo"
    },
    {
      name: "School",
      description: "For schools and educational departments",
      price: {
        monthly: "99",
        annually: "990"
      },
      features: [
        { text: "Everything in Educator plan", included: true },
        { text: "Bulk scanning capabilities", included: true },
        { text: "Advanced performance analytics", included: true },
        { text: "Up to 10 administrator accounts", included: true },
        { text: "24/7 priority support", included: true },
        { text: "Complete question bank access", included: true },
        { text: "Unlimited customizable templates", included: true },
        { text: "School-wide analytics dashboard", included: true },
        { text: "LMS integration", included: true },
        { text: "Branded answer sheets", included: true }
      ],
      buttonText: "Contact Sales",
      buttonLink: "/contact",
      highlight: true,
      color: "purple"
    },
    {
      name: "Enterprise",
      description: "For districts and large institutions",
      price: {
        monthly: "Custom",
        annually: "Custom"
      },
      features: [
        { text: "Everything in School plan", included: true },
        { text: "Unlimited scanning", included: true },
        { text: "Custom analytics solutions", included: true },
        { text: "Unlimited administrator accounts", included: true },
        { text: "Dedicated support manager", included: true },
        { text: "Custom question types", included: true },
        { text: "White-label solution", included: true },
        { text: "API access", included: true },
        { text: "On-premise deployment option", included: true },
        { text: "Custom feature development", included: true }
      ],
      buttonText: "Contact Sales",
      buttonLink: "/contact",
      highlight: false,
      color: "blue"
    }
  ];

  // Frequently asked questions about pricing
  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan at any time?",
      answer: "Yes, you can upgrade your plan at any time and the new features will be immediately available. If you downgrade, the changes will take effect at the start of your next billing cycle."
    },
    {
      question: "Is there a limit to how many students I can assess?",
      answer: "No, there is no limit to the number of students you can assess with any paid plan. Our platform is designed to scale with your needs."
    },
    {
      question: "Do you offer educational discounts?",
      answer: "Yes, we offer special pricing for educational institutions. Please contact our sales team for more information about our educational discount program."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and for Enterprise plans, we can arrange for invoice payment via bank transfer."
    },
    {
      question: "Is there a contract or can I cancel anytime?",
      answer: "There is no long-term contract. Monthly plans can be canceled at any time. Annual plans can also be canceled, but refunds are provided on a prorated basis."
    }
  ];

  // State to toggle between monthly and annual pricing
  const [billingPeriod, setBillingPeriod] = React.useState('monthly');

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-[10%] -right-[15%] w-[40%] h-[40%] bg-gradient-to-br from-purple-100/80 to-indigo-100/80 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute -bottom-[10%] -left-[15%] w-[40%] h-[40%] bg-gradient-to-br from-indigo-100/80 to-blue-100/80 rounded-full blur-[120px] opacity-60"></div>
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
                <span className="text-sm font-medium text-purple-800">Simple, Transparent Pricing</span>
              </div>
            </motion.div>
            
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Choose the Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600">Plan</span> for Your Needs
            </motion.h1>
            
            <motion.p
              className="text-lg text-gray-600 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Whether you're an individual educator or a large institution, we have flexible 
              options to meet your assessment needs at any scale.
            </motion.p>

            {/* Billing toggle */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative inline-flex p-1 bg-gray-100 rounded-full">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`${
                    billingPeriod === 'monthly'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'bg-transparent text-gray-500 hover:text-gray-700'
                  } px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 relative`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annually')}
                  className={`${
                    billingPeriod === 'annually'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'bg-transparent text-gray-500 hover:text-gray-700'
                  } px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 relative`}
                >
                  Annually <span className="text-xs text-green-600 font-bold">Save 20%</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 h-full flex flex-col 
                ${tier.highlight ? 'border-2 border-purple-500 relative scale-[1.03] shadow-xl shadow-purple-100' : 'border border-gray-200 shadow-sm'}`}
            >
              {tier.highlight && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-max px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className={`text-2xl font-bold mb-2 
                  ${tier.color === "purple" ? "text-purple-600" : 
                    tier.color === "indigo" ? "text-indigo-600" : 
                    tier.color === "blue" ? "text-blue-600" : 
                    "text-gray-600"}`}
                >
                  {tier.name}
                </h3>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold">
                    {typeof tier.price[billingPeriod] === 'number' ? '$' : ''}
                    {tier.price[billingPeriod]}
                  </span>
                  {tier.price[billingPeriod] !== 'Custom' && (
                    <span className="text-gray-500 ml-2">
                      /{billingPeriod === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
                
                {billingPeriod === 'annually' && tier.price.annually !== 'Custom' && tier.price.annually !== '0' && (
                  <p className="text-green-600 text-sm font-medium">
                    Save ${parseInt(tier.price.monthly) * 12 - parseInt(tier.price.annually)} annually
                  </p>
                )}
              </div>
              
              <div className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`ml-3 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto">
                <Link
                  to={tier.buttonLink}
                  className={`w-full flex justify-center items-center px-6 py-3 rounded-lg font-medium transition-all duration-300
                    ${tier.highlight ? 
                      'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/20' : 
                      (tier.color === "indigo" ? 
                        'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20' : 
                        (tier.color === "blue" ? 
                          'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' : 
                          'border border-gray-200 hover:bg-gray-50 text-gray-700'))}`}
                >
                  {tier.buttonText}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
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
              Detailed Plan <span className="text-purple-600">Comparison</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Compare features across all plans to find the perfect fit for your needs
            </motion.p>
          </div>
          
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500">Features</th>
                    {tiers.map((tier, index) => (
                      <th 
                        key={index} 
                        scope="col" 
                        className={`px-6 py-4 text-center text-sm font-medium
                          ${tier.color === "purple" ? "text-purple-600" : 
                            tier.color === "indigo" ? "text-indigo-600" : 
                            tier.color === "blue" ? "text-blue-600" : 
                            "text-gray-500"}`}
                      >
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {[
                    { feature: "AI-generated questions", values: ["25/month", "Unlimited", "Unlimited", "Unlimited"] },
                    { feature: "Answer sheet scanning", values: ["Basic", "Advanced", "Bulk capability", "Unlimited"] },
                    { feature: "Analytics", values: ["Basic", "Detailed", "Advanced", "Custom"] },
                    { feature: "Administrator accounts", values: ["1", "1", "Up to 10", "Unlimited"] },
                    { feature: "Support level", values: ["Email", "Priority email", "24/7 priority", "Dedicated manager"] },
                    { feature: "Question bank access", values: ["No", "Yes", "Complete access", "Complete access"] },
                    { feature: "Custom templates", values: ["No", "5 templates", "Unlimited", "Unlimited"] },
                    { feature: "LMS integration", values: ["No", "No", "Yes", "Yes"] },
                    { feature: "API access", values: ["No", "No", "No", "Yes"] },
                    { feature: "Customization", values: ["No", "Basic", "Advanced", "White-label"] }
                  ].map((row, rowIndex) => (
                    <motion.tr 
                      key={rowIndex}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: rowIndex * 0.03 }}
                      viewport={{ once: true }}
                      className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                      {row.values.map((value, valueIndex) => (
                        <td key={valueIndex} className="px-6 py-4 text-center text-sm text-gray-500">
                          {value === "Yes" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : value === "No" ? (
                            <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              Frequently Asked <span className="text-purple-600">Questions</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Find answers to common questions about our pricing and plans
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
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 -bottom-40 w-80 h-80 rounded-full bg-purple-500 mix-blend-multiply opacity-70"></div>
          <div className="absolute right-0 top-10 w-72 h-72 rounded-full bg-indigo-400 mix-blend-multiply opacity-70"></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Not Sure Which Plan Is Right For You?</h2>
            <p className="text-purple-100 mb-10 text-lg max-w-2xl mx-auto">
              Our team is happy to help you find the perfect solution for your specific needs. 
              Contact us for a personalized consultation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-3 bg-white text-purple-600 hover:bg-purple-50 font-medium rounded-lg flex items-center justify-center shadow-lg transition-all duration-300"
              >
                Contact Sales
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 border border-white/30 text-white hover:bg-white/10 flex items-center justify-center rounded-lg font-medium transition-all duration-300"
              >
                Try For Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 