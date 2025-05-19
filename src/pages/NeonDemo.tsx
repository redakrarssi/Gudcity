import React, { useState } from 'react';
import CommentForm from '../components/CommentForm';
import DatabaseConnectionTest from '../components/DatabaseConnectionTest';

const NeonDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'demo' | 'test'>('demo');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Neon Database Integration</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <p className="text-blue-700">
            This page demonstrates the integration with Neon Serverless PostgreSQL database.
            You can test basic functionality or run comprehensive database tests.
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex -mb-px">
            <button 
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'demo' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('demo')}
            >
              Comment Demo
            </button>
            <button 
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'test' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('test')}
            >
              Database Tests
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'demo' ? (
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
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Database Connection Tests</h2>
            <p className="mb-6 text-gray-600">
              Run comprehensive tests to verify your database connection and table configuration.
              These tests will check if all required tables exist and are accessible.
            </p>
            <DatabaseConnectionTest />
          </div>
        )}
      </div>
    </div>
  );
};

export default NeonDemo; 