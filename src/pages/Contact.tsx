import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

const Contact: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Contact Us - GudCity Loyalty';
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    interest: 'general'
  });
  
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    error: boolean;
    message: string;
  }>({
    submitted: false,
    error: false,
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real application, you would send the form data to a server here
    // This is a mock submission that always succeeds
    
    console.log('Form submitted:', formData);
    
    // Simulate an API call
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        error: false,
        message: 'Thank you for your message! We will get back to you soon.'
      });
      
      // Reset form data
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        interest: 'general'
      });
      
      // Reset form status after 5 seconds
      setTimeout(() => {
        setFormStatus({
          submitted: false,
          error: false,
          message: ''
        });
      }, 5000);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Talk to Sales',
      details: '+1 (555) 123-4567',
      description: 'Speak with our friendly sales team'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Contact Customer Support',
      details: 'support@gudcity.com',
      description: 'Get help with your loyalty program'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Visit our Office',
      details: '123 Loyalty Street, San Francisco, CA 94103',
      description: 'Come say hello at our headquarters'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Business Hours',
      details: 'Monday - Friday, 9AM - 5PM PST',
      description: 'We are closed on weekends and major holidays'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-blue-700 py-16 sm:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute bottom-0 left-0 transform translate-x-80 -translate-y-20 opacity-20"
            width="640"
            height="784"
            fill="none"
            viewBox="0 0 640 784"
          >
            <defs>
              <pattern
                id="contact-pattern"
                x="118"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="4" height="4" fill="white" />
              </pattern>
            </defs>
            <rect
              width="640"
              height="784"
              fill="url(#contact-pattern)"
            />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Contact Us
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Have questions about our loyalty solutions? Looking to boost your customer retention? Get in touch with our team today.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="relative z-10 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-md text-blue-600 mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
              <p className="mt-2 text-gray-900 font-medium">{item.details}</p>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Send us a message</h2>
              <p className="mt-4 text-lg text-gray-500">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {formStatus.submitted && (
                  <div className={`rounded-md p-4 ${formStatus.error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className={`text-sm font-medium ${formStatus.error ? 'text-red-800' : 'text-green-800'}`}>
                      {formStatus.message}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="company"
                        id="company"
                        autoComplete="organization"
                        value={formData.company}
                        onChange={handleChange}
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="interest" className="block text-sm font-medium text-gray-700">
                      What are you interested in?
                    </label>
                    <div className="mt-1">
                      <select
                        id="interest"
                        name="interest"
                        value={formData.interest}
                        onChange={handleChange}
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="sales">Sales Information</option>
                        <option value="support">Technical Support</option>
                        <option value="partnership">Partnership Opportunities</option>
                        <option value="demo">Request a Demo</option>
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Map and Additional Info */}
            <div>
              <div className="h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-lg overflow-hidden">
                {/* In a real application, you would embed a Google Map or similar here */}
                <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-blue-600" />
                  <span className="ml-2 text-blue-800 font-medium">123 Loyalty Street, San Francisco</span>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">Additional Contact Information</h3>
                <dl className="mt-4 space-y-6">
                  <div>
                    <dt className="sr-only">Postal address</dt>
                    <dd className="flex">
                      <MapPin className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                      <span className="ml-3 text-gray-500">
                        123 Loyalty Street<br />
                        San Francisco, CA 94103<br />
                        United States
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Phone number</dt>
                    <dd className="flex">
                      <Phone className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                      <span className="ml-3 text-gray-500">+1 (555) 123-4567</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Email</dt>
                    <dd className="flex">
                      <Mail className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                      <span className="ml-3 text-gray-500">info@gudcity.com</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-500">
              Can't find the answer you're looking for? Reach out to our customer support team.
            </p>
          </div>
          
          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-3">
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  How quickly can I get started with GudCity Loyalty?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Most businesses can set up and launch their loyalty program within a day. Our onboarding team is available to help with the setup process.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Do you offer a free trial?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, we offer a 14-day free trial on all our plans. No credit card required to start.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Can I integrate GudCity with my existing POS system?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, GudCity integrates with most major POS systems. Contact our sales team for specific compatibility information.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  What types of loyalty programs can I create?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Our platform supports points-based programs, punch cards, tiered VIP programs, referral programs, and custom hybrid programs.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  How secure is customer data on your platform?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  We take data security seriously. All customer data is encrypted and stored securely in compliance with industry standards and regulations.
                </dd>
              </div>
              <div>
                <dt className="text-lg leading-6 font-medium text-gray-900">
                  Can I export my customer data?
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, you can export your customer data at any time in various formats including CSV and Excel.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact; 