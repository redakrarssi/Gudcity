import React, { useState, useEffect } from 'react';
import { Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ReportsAnalytics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Mock data state
  const [metricsData, setMetricsData] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalBusinesses: 0,
    totalTransactions: 0,
    pointsIssued: 0,
    pointsRedeemed: 0,
    redemptionRate: 0,
    averagePointsPerUser: 0,
  });
  
  // Load data based on timeframe
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      // Mock metrics data based on timeframe
      setMetricsData({
        totalUsers: 7435,
        newUsers: timeframe === 'week' ? 123 : timeframe === 'month' ? 485 : timeframe === 'quarter' ? 1245 : 3650,
        totalBusinesses: 256,
        totalTransactions: timeframe === 'week' ? 1256 : timeframe === 'month' ? 5483 : timeframe === 'quarter' ? 15345 : 58432,
        pointsIssued: timeframe === 'week' ? 34500 : timeframe === 'month' ? 142500 : timeframe === 'quarter' ? 430000 : 1650000,
        pointsRedeemed: timeframe === 'week' ? 12350 : timeframe === 'month' ? 53200 : timeframe === 'quarter' ? 162400 : 610500,
        redemptionRate: 35.8,
        averagePointsPerUser: 221,
      });
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeframe]);
  
  // Chart data generators
  
  // User growth chart data
  const getUserGrowthData = () => {
    let labels, data;
    
    switch(timeframe) {
      case 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        data = [15, 21, 18, 24, 32, 25, 18];
        break;
      case 'month':
        labels = [...Array(30)].map((_, i) => i + 1);
        data = labels.map(() => Math.floor(Math.random() * 30) + 10);
        break;
      case 'quarter':
        labels = ['Jan', 'Feb', 'Mar'];
        data = [145, 165, 180];
        break;
      case 'year':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = [320, 350, 365, 390, 410, 425, 435, 460, 485, 510, 530, 545];
        break;
      default:
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        data = [15, 21, 18, 24, 32, 25, 18];
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'New Users',
          data,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: 'rgba(99, 102, 241, 1)',
          tension: 0.4,
        }
      ]
    };
  };
  
  // Transaction volume chart data
  const getTransactionVolumeData = () => {
    let labels;
    
    switch(timeframe) {
      case 'week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        break;
      case 'month':
        labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        break;
      case 'quarter':
        labels = ['Month 1', 'Month 2', 'Month 3'];
        break;
      case 'year':
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        break;
      default:
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Points Issued',
          data: labels.map(() => Math.floor(Math.random() * 5000) + 2000),
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
        {
          label: 'Points Redeemed',
          data: labels.map(() => Math.floor(Math.random() * 2000) + 500),
          backgroundColor: 'rgba(245, 158, 11, 0.5)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1,
        },
      ]
    };
  };
  
  // Business category distribution
  const getBusinessCategoryData = () => {
    return {
      labels: ['Retail', 'Food & Beverage', 'Services', 'Entertainment', 'Health & Wellness', 'Other'],
      datasets: [
        {
          data: [35, 25, 15, 10, 10, 5],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(107, 114, 128, 0.7)',
          ],
          borderWidth: 1,
        },
      ]
    };
  };
  
  // Redemption type distribution
  const getRedemptionTypeData = () => {
    return {
      labels: ['Discounts', 'Free Products', 'Services', 'Experiences', 'Cash Back', 'Other'],
      datasets: [
        {
          data: [40, 30, 15, 8, 5, 2],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(107, 114, 128, 0.7)',
          ],
          borderWidth: 1,
        },
      ]
    };
  };
  
  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Analyze loyalty program performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="block rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="block rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {}}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 1000);
            }}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading placeholders
          [...Array(8)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="p-4 h-24">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
                <p className="mt-1 text-2xl font-semibold">{formatNumber(metricsData.totalUsers)}</p>
                <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                  +{formatNumber(metricsData.newUsers)} in selected period
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Businesses</h3>
                <p className="mt-1 text-2xl font-semibold">{formatNumber(metricsData.totalBusinesses)}</p>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Active partners
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</h3>
                <p className="mt-1 text-2xl font-semibold">{formatNumber(metricsData.totalTransactions)}</p>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  In selected period
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Points Issued</h3>
                <p className="mt-1 text-2xl font-semibold">{formatNumber(metricsData.pointsIssued)}</p>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  In selected period
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Points Redeemed</h3>
                <p className="mt-1 text-2xl font-semibold">{formatNumber(metricsData.pointsRedeemed)}</p>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  In selected period
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Redemption Rate</h3>
                <p className="mt-1 text-2xl font-semibold">{metricsData.redemptionRate}%</p>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Points redeemed / Points issued
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Points per User</h3>
                <p className="mt-1 text-2xl font-semibold">{metricsData.averagePointsPerUser}</p>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Among active users
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Generated</h3>
                <p className="mt-1 text-2xl font-semibold">$58,732</p>
                <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                  +12.5% from last period
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">User Growth</h2>
          </div>
          <div className="p-4">
            <div className="h-80">
              {isLoading ? (
                <div className="animate-pulse h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <Line
                  data={getUserGrowthData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Transaction Volume</h2>
          </div>
          <div className="p-4">
            <div className="h-80">
              {isLoading ? (
                <div className="animate-pulse h-full bg-gray-200 dark:bg-gray-700 rounded"></div>
              ) : (
                <Bar
                  data={getTransactionVolumeData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Business Categories</h2>
          </div>
          <div className="p-4">
            <div className="h-80 flex items-center justify-center">
              {isLoading ? (
                <div className="animate-pulse h-64 w-64 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              ) : (
                <div className="max-w-xs mx-auto">
                  <Doughnut
                    data={getBusinessCategoryData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Redemption Types</h2>
          </div>
          <div className="p-4">
            <div className="h-80 flex items-center justify-center">
              {isLoading ? (
                <div className="animate-pulse h-64 w-64 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              ) : (
                <div className="max-w-xs mx-auto">
                  <Doughnut
                    data={getRedemptionTypeData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      {/* Top Performers */}
      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">Top Performing Businesses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active Customers
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Points Issued
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Redemption Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                // Loading placeholders
                [...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                  </tr>
                ))
              ) : (
                [
                  { id: '1', name: 'Coffee Corner', category: 'Food & Beverage', activeCustomers: 457, pointsIssued: 45700, redemptionRate: 42, revenue: 8650 },
                  { id: '2', name: 'Tech World', category: 'Electronics', activeCustomers: 356, pointsIssued: 35600, redemptionRate: 38, revenue: 12400 },
                  { id: '3', name: 'Fitness First', category: 'Health & Wellness', activeCustomers: 289, pointsIssued: 28900, redemptionRate: 35, revenue: 8950 },
                  { id: '4', name: 'Book Haven', category: 'Retail', activeCustomers: 264, pointsIssued: 26400, redemptionRate: 32, revenue: 6540 },
                  { id: '5', name: 'Fancy Fashion', category: 'Clothing', activeCustomers: 218, pointsIssued: 21800, redemptionRate: 30, revenue: 7820 },
                ].map((business) => (
                  <tr key={business.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {business.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {business.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {business.activeCustomers}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {business.pointsIssued.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {business.redemptionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      ${business.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReportsAnalytics; 