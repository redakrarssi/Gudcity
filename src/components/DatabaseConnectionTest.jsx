import React, { useState, useEffect } from 'react';
import { runAllConnectionTests } from '../services/dbConnectionTest';

/**
 * Component to test database connectivity
 * This component allows users to test the connection between the website and the database
 */
function DatabaseConnectionTest() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await runAllConnectionTests();
      setTestResults(results);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error running database tests:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Database Connection Test</h2>
      
      <button
        onClick={runTests}
        disabled={loading}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Running Tests...' : 'Test Database Connection'}
      </button>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {testResults && (
        <div className="space-y-6">
          <div className={`p-4 rounded ${testResults.overall ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <h3 className="font-bold text-lg">Overall Status: {testResults.overall ? 'Success ✅' : 'Failed ❌'}</h3>
          </div>
          
          <TestResultItem
            title="Database Connection"
            result={testResults.connection}
            details={[
              { label: 'Latency', value: `${testResults.connection.latencyMs}ms` }
            ]}
          />
          
          <TestResultItem
            title="Database Read"
            result={testResults.read}
            details={[
              { label: 'Tables Found', value: testResults.read.tableCount }
            ]}
          >
            {testResults.read.tables && (
              <div className="mt-2">
                <p className="font-semibold">Tables:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mt-1">
                  {testResults.read.tables.map(table => (
                    <div key={table} className="bg-gray-100 px-2 py-1 rounded text-sm">{table}</div>
                  ))}
                </div>
              </div>
            )}
          </TestResultItem>
          
          <TestResultItem
            title="Database Write"
            result={testResults.write}
            details={[
              { label: 'Test Comment', value: testResults.write.comment || 'N/A' }
            ]}
          />
          
          <TestResultItem
            title="Required Tables Check"
            result={testResults.tables}
            details={[
              { label: 'Missing Tables', value: testResults.tables.missingTables.length > 0 ? 
                testResults.tables.missingTables.join(', ') : 'None' }
            ]}
          />
        </div>
      )}
    </div>
  );
}

// Helper component for displaying test results
function TestResultItem({ title, result, details = [], children }) {
  const isSuccess = result?.success;
  
  return (
    <div className={`p-4 rounded border ${isSuccess ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
      <div className="flex justify-between items-start">
        <h4 className="font-bold">{title}</h4>
        <span className={`px-2 py-1 rounded text-white text-sm ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
          {isSuccess ? 'SUCCESS' : 'FAILED'}
        </span>
      </div>
      <p className="text-gray-700 mt-2">{result?.message}</p>
      
      {details.length > 0 && (
        <div className="mt-3 space-y-1">
          {details.map((detail, index) => (
            <div key={index} className="flex text-sm">
              <span className="font-medium w-28">{detail.label}:</span>
              <span>{detail.value}</span>
            </div>
          ))}
        </div>
      )}
      
      {children}
    </div>
  );
}

export default DatabaseConnectionTest; 