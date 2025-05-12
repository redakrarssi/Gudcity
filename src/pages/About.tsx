import React from 'react';
import { Award, Users, Shield, Heart } from 'lucide-react';

const About: React.FC = () => {
  React.useEffect(() => {
    document.title = 'About Us - GudCity Loyalty';
  }, []);

  const values = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: 'Customer First',
      description: 'We believe in putting customers at the heart of everything we do, both our clients and their customers.'
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: 'Excellence',
      description: 'We strive for excellence in our products, service, and support, continuously improving to deliver the best experience.'
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: 'Integrity',
      description: 'We act with honesty, transparency, and ethical conduct in all our business relationships and practices.'
    },
    {
      icon: <Heart className="h-8 w-8 text-blue-600" />,
      title: 'Passion',
      description: 'We are passionate about helping businesses build lasting relationships with their customers through loyalty.'
    }
  ];

  const team = [
    {
      name: 'Alex Johnson',
      role: 'Chief Executive Officer',
      bio: 'Alex founded GudCity with a vision to help small businesses compete through innovative loyalty programs.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      name: 'Maya Patel',
      role: 'Chief Technology Officer',
      bio: 'Maya leads our technology team, bringing over 15 years of software development experience to GudCity.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      name: 'Carlos Rodriguez',
      role: 'Head of Customer Success',
      bio: 'Carlos ensures all our clients get the most out of GudCity with personalized onboarding and ongoing support.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      name: 'Sarah Chen',
      role: 'Marketing Director',
      bio: 'Sarah oversees our marketing strategy, bringing GudCity solutions to businesses around the world.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&h=256&q=80'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
              <div>
                <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-gray-900 sm:mt-5 sm:text-5xl lg:mt-6 xl:text-6xl">
                  <span className="block">Our Mission at</span>
                  <span className="block text-blue-600">GudCity Loyalty</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  We're on a mission to transform how businesses build and maintain customer loyalty. Our platform helps businesses of all sizes create, manage, and optimize loyalty programs that drive customer retention and increase revenue.
                </p>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
              <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden lg:max-w-none">
                <div className="px-4 py-8 sm:px-10">
                  <div className="relative h-96 bg-blue-600 rounded-lg shadow-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
                    <div className="absolute bottom-0 left-0 right-0 px-6 py-8 text-white">
                      <p className="text-lg font-medium">Founded in 2020</p>
                      <p className="mt-1">
                        GudCity was created to bring enterprise-level loyalty programs to small and medium businesses at an affordable price.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Story</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How GudCity Began
            </p>
          </div>
          
          <div className="prose prose-blue prose-lg mx-auto">
            <p>
              GudCity Loyalty was born out of necessity. Our founder, Alex Johnson, ran a small coffee shop and wanted to implement a loyalty program but found that existing solutions were either too expensive, too complicated, or too limited in functionality.
            </p>
            <p>
              Recognizing that many small business owners faced the same challenge, Alex partnered with technology expert Maya Patel to create a solution that would be accessible, affordable, and effective for businesses of all sizes.
            </p>
            <p>
              Since our launch in 2020, we've helped thousands of businesses across the globe implement loyalty programs that have significantly increased customer retention and revenue. What started as a solution for small coffee shops has grown into a comprehensive platform serving businesses in retail, food service, hospitality, and many other industries.
            </p>
            <p>
              Today, GudCity Loyalty continues to innovate and expand, always with our core mission in mind: empowering businesses to build stronger relationships with their customers through effective loyalty programs.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Values</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What We Stand For
            </p>
          </div>
          
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          {value.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{value.title}</h3>
                      <p className="mt-5 text-base text-gray-500">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Team</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              The People Behind GudCity
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our diverse team brings together expertise in technology, business, and customer experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            {team.map((member, index) => (
              <div key={index} className="flex flex-col sm:flex-row">
                <div className="flex-shrink-0">
                  <img 
                    className="h-48 w-48 rounded-lg object-cover" 
                    src={member.image} 
                    alt={member.name} 
                  />
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                  <h3 className="text-xl font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm font-medium text-blue-600">{member.role}</p>
                  <p className="mt-2 text-base text-gray-500">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 