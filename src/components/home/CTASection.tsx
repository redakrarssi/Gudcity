import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const CTASection: React.FC = () => {
  return (
    <section className="bg-blue-700 content-visibility-auto">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to boost your business?</span>
          <span className="block text-amber-400">Start your free trial today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link to="/register">
              <Button variant="secondary" size="lg">
                Get started
              </Button>
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link to="/login">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-700">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(CTASection); 