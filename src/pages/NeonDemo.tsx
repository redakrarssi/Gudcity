import React from 'react';
import CommentForm from '../components/CommentForm';

const NeonDemo: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Neon Database Integration Demo</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">About This Demo</h2>
          <p className="mb-4">
            This page demonstrates integration between our application and Neon Database using the 
            <code className="bg-gray-100 px-1 mx-1 rounded">@neondatabase/serverless</code> driver.
          </p>
          <p>
            The comment form below allows you to add comments that are stored in a Neon PostgreSQL database
            and retrieved in real-time.
          </p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <CommentForm />
        </div>
      </div>
    </div>
  );
};

export default NeonDemo; 