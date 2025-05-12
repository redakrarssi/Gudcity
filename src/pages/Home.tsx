import React, { lazy, Suspense, memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Star, Users, ShoppingBag, Trophy, ArrowRight, Award, BarChart } from 'lucide-react';
import Button from '../components/ui/Button';
import GudcityLogo from '../assets/logo';

// Lazy-loaded components for better initial loading
const PricingSection = lazy(() => import('../components/home/PricingSection'));
const CTASection = lazy(() => import('../components/home/CTASection'));

// Memoized components for better performance
const Feature = memo(({ icon: Icon, title, description }: { 
  icon: React.FC<{ className?: string }>, 
  title: string, 
  description: string 
}) => (
  <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg content-visibility-auto">
    <div className="p-3 rounded-full bg-blue-100">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
    <h3 className="mt-5 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-2 text-base text-gray-500">{description}</p>
  </div>
));

const Header = memo(() => (
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center">
          <GudcityLogo width={150} height={60} />
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
            Log in
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </header>
));

const HeroSection = memo(() => (
  <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-blue-900 opacity-90"></div>
    </div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight text-center">
        Transform Customer Loyalty <br /> for Your Business
      </h1>
      <p className="mt-6 text-xl text-blue-100 text-center max-w-3xl">
        GudCity Loyalty helps businesses of all sizes create, manage, and grow customer loyalty programs that drive retention and increase revenue.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          to="/contact" 
          className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-lg"
        >
          Get Started
        </Link>
        <Link 
          to="/services" 
          className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 shadow-lg"
        >
          Learn More
        </Link>
      </div>
    </div>
  </section>
));

const Home: React.FC = () => {
  // SEO metadata would be handled by a library like react-helmet
  // but for this example we'll just set the document title
  React.useEffect(() => {
    document.title = 'GudCity Loyalty - Customer Loyalty Management System';
  }, []);

  const features = [
    {
      name: 'Customer Retention',
      description: 'Keep your customers coming back with powerful loyalty programs designed to foster long-term relationships.',
      icon: <Users className="h-8 w-8 text-blue-600" />
    },
    {
      name: 'Reward Management',
      description: 'Create and manage customized rewards that incentivize repeat purchases and increase customer lifetime value.',
      icon: <Award className="h-8 w-8 text-blue-600" />
    },
    {
      name: 'Advanced Analytics',
      description: 'Gain valuable insights into customer behavior and program performance with detailed analytics dashboards.',
      icon: <BarChart className="h-8 w-8 text-blue-600" />
    }
  ];

  const testimonials = [
    {
      content: "GudCity Loyalty has transformed our business. We've seen a 40% increase in repeat customers since implementing the system.",
      author: "Sarah Johnson",
      position: "Owner, Bright Brew Coffee",
      stars: 5
    },
    {
      content: "The analytics tools provided by GudCity have helped us understand our customers better and tailor our loyalty program accordingly.",
      author: "Michael Chen",
      position: "CEO, Urban Retail Group",
      stars: 5
    },
    {
      content: "Easy to set up and our customers love it. The QR code system makes it simple for both staff and customers to use.",
      author: "David Rodriguez",
      position: "Manager, Sunset Restaurant",
      stars: 4
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-blue-900 opacity-90"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight text-center">
            Transform Customer Loyalty <br /> for Your Business
          </h1>
          <p className="mt-6 text-xl text-blue-100 text-center max-w-3xl">
            GudCity Loyalty helps businesses of all sizes create, manage, and grow customer loyalty programs that drive retention and increase revenue.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 shadow-lg"
            >
              Get Started
            </Link>
            <Link 
              to="/services" 
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need for Customer Loyalty
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our comprehensive loyalty management system provides all the tools needed to create, manage, and analyze your customer loyalty programs.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-8 transition duration-300 hover:shadow-md">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.name}</h3>
                  <p className="mt-4 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple and Effective Loyalty Management
            </p>
          </div>
          
          <div className="mt-16">
            <div className="relative">
              <div className="flex flex-col md:flex-row space-y-12 md:space-y-0 md:space-x-8">
                <div className="flex-1">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                        1
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Set up your loyalty program</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Configure your loyalty program types, point values, and reward structures based on your business needs.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                        2
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Enroll your customers</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Add customers to your program with our easy-to-use interface or import your existing customer database.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                        3
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Track purchases & rewards</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Record transactions, award points, and track reward redemptions through our intuitive dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl shadow-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.stars ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill={i < testimonial.stars ? 'currentColor' : 'none'} 
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to boost your customer loyalty?</span>
              <span className="block text-blue-200">Get started with GudCity Loyalty today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;