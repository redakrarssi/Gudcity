import React from 'react';
import CommentForm from '../components/CommentForm';

const NeonDemo: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Neon Database Demo</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <p className="text-blue-700">
            This page demonstrates the integration with Neon Serverless PostgreSQL database.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <CommentForm />
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">About This Demo</h2>
            <p className="mb-4">
              The comment form on this page connects to a Neon PostgreSQL database using the serverless driver.
            </p>
            <p className="mb-4">
              Comments you submit are stored in the database and retrieved when the page loads.
            </p>
            <p className="mb-4">
              This demonstrates a full-stack integration with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>React frontend components</li>
              <li>Neon serverless driver</li>
              <li>PostgreSQL database</li>
              <li>Async data fetching</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeonDemo; 