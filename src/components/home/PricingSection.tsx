import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

const PricingTier = memo(({ 
  name, 
  description, 
  price, 
  features, 
  highlighted = false,
}: {
  name: string;
  description: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) => (
  <div className={`border ${highlighted ? 'border-blue-500' : 'border-gray-200'} rounded-lg shadow-sm bg-white overflow-hidden`}>
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900">{name}</h3>
      <p className="mt-4 text-sm text-gray-500">{description}</p>
      <p className="mt-8">
        <span className="text-4xl font-extrabold text-gray-900">{price}</span>
        <span className="text-base font-medium text-gray-500">/month</span>
      </p>
      <Link to="/register" className="mt-8 block w-full">
        <Button variant={highlighted ? "primary" : "outline"} fullWidth>
          Get started
        </Button>
      </Link>
    </div>
    <div className="px-6 pt-6 pb-8">
      <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included:</h4>
      <ul className="mt-6 space-y-4">
        {features.map((feature, i) => (
          <li key={i} className="flex space-x-3">
            <ChevronRight className="flex-shrink-0 h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-500">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
));

const PricingSection: React.FC = () => {
  const pricingData = [
    {
      name: "Free",
      description: "Perfect for trying out our loyalty program",
      price: "$0",
      highlighted: false,
      features: [
        "Up to 100 customers",
        "Basic loyalty program",
        "Customer management",
        "Email support",
      ]
    },
    {
      name: "Basic",
      description: "For small businesses ready to grow",
      price: "$20",
      highlighted: true,
      features: [
        "Up to 500 customers",
        "All program types",
        "Custom branding",
        "Email campaigns",
        "Basic analytics",
        "Priority email support",
      ]
    },
    {
      name: "Premium",
      description: "For established businesses",
      price: "$45",
      highlighted: false,
      features: [
        "Up to 2,000 customers",
        "SMS notifications",
        "Advanced analytics",
        "Multi-location support",
        "API access",
        "Phone & email support",
      ]
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-gray-50 content-visibility-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Start with our free plan and upgrade as your business grows.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pricingData.map((tier, index) => (
            <PricingTier
              key={index}
              name={tier.name}
              description={tier.description}
              price={tier.price}
              features={tier.features}
              highlighted={tier.highlighted}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(PricingSection); 