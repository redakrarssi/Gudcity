import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  BarChart, 
  CreditCard, 
  Database, 
  MessageSquare, 
  Phone, 
  Settings, 
  ShoppingBag, 
  Users,
  Check
} from 'lucide-react';

const Services: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Our Services - GudCity Loyalty';
  }, []);

  const mainServices = [
    {
      icon: <Users className="h-10 w-10 text-blue-600" />,
      title: 'Loyalty Program Management',
      description: 'Create and manage custom loyalty programs tailored to your business needs. Choose from points-based systems, tiered rewards, punch cards, and more.',
      features: [
        'Multiple program types',
        'Custom reward levels',
        'Flexible point values',
        'Member tiers and VIP options'
      ]
    },
    {
      icon: <ShoppingBag className="h-10 w-10 text-blue-600" />,
      title: 'Customer Transaction Tracking',
      description: 'Easily record customer purchases, award points, and track redemptions with our intuitive transaction management system.',
      features: [
        'Simple purchase recording',
        'Automatic point calculation',
        'Reward redemption tracking',
        'Transaction history and reporting'
      ]
    },
    {
      icon: <BarChart className="h-10 w-10 text-blue-600" />,
      title: 'Analytics & Reporting',
      description: 'Gain valuable insights into your loyalty program performance with detailed analytics and customizable reports.',
      features: [
        'Program performance metrics',
        'Customer engagement analysis',
        'ROI calculations',
        'Customizable dashboards'
      ]
    }
  ];

  const additionalServices = [
    {
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
      title: 'Digital Loyalty Cards',
      description: 'Replace physical punch cards with digital alternatives. Customers can track their progress via mobile.',
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
      title: 'Customer Communication',
      description: 'Send targeted messages, promotions, and updates to your loyalty program members.',
    },
    {
      icon: <Database className="h-6 w-6 text-blue-600" />,
      title: 'Customer Database',
      description: 'Maintain a comprehensive database of your customers, their preferences, and purchase history.',
    },
    {
      icon: <Award className="h-6 w-6 text-blue-600" />,
      title: 'Automated Rewards',
      description: 'Set up automatic rewards that trigger when customers reach certain milestones or thresholds.',
    },
    {
      icon: <Settings className="h-6 w-6 text-blue-600" />,
      title: 'Customization Options',
      description: 'Tailor the loyalty program to match your brand with custom colors, logos, and messaging.',
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: 'Mobile App Integration',
      description: 'Integrate your loyalty program with your existing mobile app or use our white-label solution.',
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for small businesses just getting started with loyalty programs.',
      features: [
        'Up to 500 members',
        'Basic loyalty program',
        'Standard reporting',
        'Email support',
        'Single user access'
      ],
      accent: false
    },
    {
      name: 'Professional',
      price: 79,
      description: 'Best for growing businesses that need more advanced features and higher capacity.',
      features: [
        'Up to 2,000 members',
        'Multiple program types',
        'Advanced analytics',
        'Priority support',
        'Up to 5 user accounts',
        'Customer segmentation',
        'Automated marketing'
      ],
      accent: true
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'For established businesses with complex needs and large customer bases.',
      features: [
        'Unlimited members',
        'Custom loyalty solutions',
        'Advanced API access',
        'Dedicated account manager',
        'Unlimited user accounts',
        'White-label options',
        'Priority development'
      ],
      accent: false
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Loyalty Management Services
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
            Comprehensive loyalty program solutions designed to help your business attract, retain, and grow your customer base.
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Core Services</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Comprehensive Loyalty Solutions
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Everything you need to create, manage, and optimize your customer loyalty program.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {mainServices.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden transition duration-300 hover:shadow-lg flex flex-col">
                <div className="px-6 py-8 bg-gray-50 h-52 flex items-center justify-center">
                  <div className="p-4 bg-white rounded-full shadow-md">
                    {service.icon}
                  </div>
                </div>
                <div className="px-6 py-8 flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Additional Offerings</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Enhanced Features & Capabilities
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Extend your loyalty program with these powerful add-ons and features.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300">
                <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-md mb-4">
                  {service.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Pricing Plans</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Find the Right Plan for Your Business
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Affordable options for businesses of all sizes, from startups to enterprises.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden border ${
                  plan.accent ? 'border-blue-600 shadow-lg relative' : 'border-gray-200'
                }`}
              >
                {plan.accent && (
                  <div className="absolute top-0 inset-x-0 px-4 py-1 bg-blue-600 text-white text-center text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className={`px-6 pt-8 ${plan.accent ? 'pt-10' : ''} pb-8`}>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                    <span className="text-xl font-medium text-gray-500 ml-1">/month</span>
                  </div>
                  <p className="mt-5 text-gray-600">{plan.description}</p>
                </div>
                <div className="border-t border-gray-200 px-6 py-8 bg-gray-50 h-full">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">What's included:</h4>
                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link
                      to="/contact"
                      className={`block w-full text-center px-4 py-3 rounded-md font-medium ${
                        plan.accent 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="text-gray-600">
              Need a custom solution? <Link to="/contact" className="text-blue-600 font-medium">Contact us</Link> for personalized pricing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to enhance your customer loyalty?</span>
              <span className="block text-blue-200">Get started with GudCity today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
                >
                  Contact Sales
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services; 