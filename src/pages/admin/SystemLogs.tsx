import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle,
  Search,
  Filter,
  Clock,
  User,
  Terminal,
  Activity,
  ShieldAlert,
  Download,
  RefreshCw,
  Calendar,
  ChevronDown,
  Server
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: 'system' | 'user' | 'api' | 'auth' | 'database';
  message: string;
  details?: string;
  userId?: string;
  userName?: string;
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulating API call to fetch logs
    const timer = setTimeout(() => {
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: '2023-09-22T14:32:15',
          level: 'error',
          source: 'system',
          message: 'Failed to process payment transaction',
          details: 'Error: Payment gateway timeout after 30s. Transaction ID: TXN-123456',
          userId: '101',
          userName: 'John Doe'
        },
        {
          id: '2',
          timestamp: '2023-09-22T13:45:08',
          level: 'warning',
          source: 'auth',
          message: 'Multiple failed login attempts',
          details: 'IP: 192.168.1.15, Attempts: 5, Account: admin@example.com',
        },
        {
          id: '3',
          timestamp: '2023-09-22T12:30:22',
          level: 'info',
          source: 'user',
          message: 'User updated profile information',
          userId: '102',
          userName: 'Jane Smith'
        },
        {
          id: '4',
          timestamp: '2023-09-22T11:15:45',
          level: 'info',
          source: 'api',
          message: 'External API integration successful',
          details: 'Connected to payment processor API v2.5'
        },
        {
          id: '5',
          timestamp: '2023-09-22T10:05:13',
          level: 'debug',
          source: 'system',
          message: 'Cache refresh completed',
          details: 'Refreshed 152 objects, Purged 28 expired items'
        },
        {
          id: '6',
          timestamp: '2023-09-22T09:30:08',
          level: 'error',
          source: 'database',
          message: 'Database connection error',
          details: 'Error establishing connection to primary database. Failover initiated to secondary instance.'
        },
        {
          id: '7',
          timestamp: '2023-09-22T08:45:20',
          level: 'warning',
          source: 'api',
          message: 'API rate limit approaching threshold',
          details: 'Current usage: 85% of allocated quota'
        },
        {
          id: '8',
          timestamp: '2023-09-21T17:32:11',
          level: 'info',
          source: 'auth',
          message: 'New admin user created',
          userId: '103',
          userName: 'Robert Johnson'
        },
        {
          id: '9',
          timestamp: '2023-09-21T16:20:45',
          level: 'error',
          source: 'database',
          message: 'Query timeout',
          details: 'Long-running query exceeded timeout threshold of 30s'
        },
        {
          id: '10',
          timestamp: '2023-09-21T15:05:32',
          level: 'debug',
          source: 'system',
          message: 'Scheduled maintenance tasks executed',
          details: 'Cleaned temporary files, optimized indexes, updated statistics'
        }
      ];
      
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter logs based on search term and filters
  useEffect(() => {
    let filtered = [...logs];
    
    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }
    
    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        log => 
          log.message.toLowerCase().includes(term) ||
          (log.details && log.details.toLowerCase().includes(term)) ||
          (log.userName && log.userName.toLowerCase().includes(term))
      );
    }
    
    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, sourceFilter]);
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const refreshLogs = () => {
    setIsLoading(true);
    // In a real app, this would trigger a new API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  const toggleLogDetails = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(logId);
    }
  };
  
  const getLevelIcon = (level: LogEntry['level']) => {
    switch(level) {
      case 'info':
        return <Activity className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <ShieldAlert className="h-4 w-4" />;
      case 'debug':
        return <Terminal className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  const getLevelStyles = (level: LogEntry['level']) => {
    switch(level) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'debug':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };
  
  const getSourceIcon = (source: LogEntry['source']) => {
    switch(source) {
      case 'system':
        return <Server className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'api':
        return <Activity className="h-4 w-4" />;
      case 'auth':
        return <ShieldAlert className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Logs</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View system activity logs and events
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={refreshLogs}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search logs..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="inline-flex shadow-sm rounded-md">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-700">
              <Filter className="h-4 w-4 mr-1" />
              Level:
            </span>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-md"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          
          <div className="inline-flex shadow-sm rounded-md">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-800 dark:border-gray-700">
              <Filter className="h-4 w-4 mr-1" />
              Source:
            </span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-md"
            >
              <option value="all">All Sources</option>
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="api">API</option>
              <option value="auth">Auth</option>
              <option value="database">Database</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Logs List */}
      <Card>
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 text-blue-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Loading system logs...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map(log => (
                <li key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div 
                    className="px-6 py-4 cursor-pointer" 
                    onClick={() => toggleLogDetails(log.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded-md ${getLevelStyles(log.level)} mr-3 flex-shrink-0`}>
                          {getLevelIcon(log.level)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{log.message}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 mr-2">
                          {log.source}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${expandedLogId === log.id ? 'transform rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {expandedLogId === log.id && (
                      <div className="mt-3 pl-8 border-t pt-3 text-sm">
                        {log.details && (
                          <div className="mb-2">
                            <div className="font-medium">Details:</div>
                            <div className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1 font-mono text-xs whitespace-pre-wrap">
                              {log.details}
                            </div>
                          </div>
                        )}
                        
                        {log.userId && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <User className="h-3 w-3 mr-1" />
                            <span>User: {log.userName} (ID: {log.userId})</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No logs found</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No logs match your current filters. Try changing your search criteria.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SystemLogs; 