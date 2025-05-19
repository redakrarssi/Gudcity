import React from 'react';
import DatabaseConnectionTest from '../components/DatabaseConnectionTest';

/**
 * Database Test Page
 * 
 * A page that lets users run tests to verify the database connection
 * from within the web application.
 */
function DatabaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Connection Tester</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This page lets you verify that the website can properly connect to and interact with 
            the Neon PostgreSQL database. Click the button below to run comprehensive tests.
          </p>
        </header>
        
        <DatabaseConnectionTest />
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">About Database Testing</h2>
          <p className="mb-4">
            This tool runs several tests to verify the database integration:
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li><strong>Connection Test:</strong> Checks that the website can connect to the database</li>
            <li><strong>Read Test:</strong> Verifies the website can read data from the database tables</li>
            <li><strong>Write Test:</strong> Confirms the website can write data to the database</li>
            <li><strong>Table Check:</strong> Ensures all required tables exist in the database</li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
            <h3 className="font-bold">Need Help?</h3>
            <p>
              If tests are failing, please check:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Your database connection string in environment variables</li>
              <li>Network connectivity to the Neon database server</li>
              <li>That all required tables have been created using the setup script</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DatabaseTestPage; 