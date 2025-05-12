import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Store, 
  Award, 
  TrendingUp, 
  UserPlus, 
  ChevronRight, 
  ShoppingBag, 
  Filter
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import Card from '../../components/ui/Card';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface UserData {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  role: string;
  points: number;
  lastActive: string;
}

interface BusinessData {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  owner: string;
  customersCount: number;
  programsCount: number;
  joinDate: string;
}

interface RedemptionData {
  id: string;
  user: string;
  business: string;
  reward: string;
  date: string;
  points: number;
}

const AdminDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalBusinesses: 0,
    pendingBusinesses: 0,
    activeBusinesses: 0,
    totalRewards: 0,
    totalRedemptions: 0,
    revenueGenerated: 0,
  });
  
  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const [pendingBusinesses, setPendingBusinesses] = useState<BusinessData[]>([]);
  const [recentRedemptions, setRecentRedemptions] = useState<RedemptionData[]>([]);

  // Load dashboard data
  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // Mock data
      setDashboardData({
        totalUsers: 1247,
        activeUsers: 843,
        newUsersToday: 23,
        totalBusinesses: 156,
        pendingBusinesses: 7,
        activeBusinesses: 142,
        totalRewards: 312,
        totalRedemptions: 5621,
        revenueGenerated: 45780,
      });
      
      // Mock recent users
      setRecentUsers([
        { id: 'u1', name: 'Jane Cooper', email: 'jane@example.com', joinDate: '2023-09-15', role: 'customer', points: 250, lastActive: '2023-09-20' },
        { id: 'u2', name: 'John Doe', email: 'john@example.com', joinDate: '2023-09-14', role: 'customer', points: 125, lastActive: '2023-09-19' },
        { id: 'u3', name: 'Robert Johnson', email: 'robert@example.com', joinDate: '2023-09-14', role: 'business', points: 0, lastActive: '2023-09-18' },
        { id: 'u4', name: 'Emily Davis', email: 'emily@example.com', joinDate: '2023-09-13', role: 'customer', points: 330, lastActive: '2023-09-17' },
      ]);
      
      // Mock pending businesses
      setPendingBusinesses([
        { id: 'b1', name: 'Coffee Corner', status: 'pending', owner: 'Sarah Miller', customersCount: 0, programsCount: 1, joinDate: '2023-09-15' },
        { id: 'b2', name: 'Book Haven', status: 'pending', owner: 'Michael Brown', customersCount: 0, programsCount: 1, joinDate: '2023-09-14' },
        { id: 'b3', name: 'Fitness First', status: 'pending', owner: 'Jessica White', customersCount: 0, programsCount: 2, joinDate: '2023-09-12' },
      ]);
      
      // Mock recent redemptions
      setRecentRedemptions([
        { id: 'r1', user: 'Alice Smith', business: 'Tech Store', reward: 'Free Screen Protector', date: '2023-09-20', points: 200 },
        { id: 'r2', user: 'Bob Johnson', business: 'Coffee Shop', reward: 'Free Latte', date: '2023-09-19', points: 100 },
        { id: 'r3', user: 'Carol Williams', business: 'Bookstore', reward: '15% Discount', date: '2023-09-18', points: 150 },
        { id: 'r4', user: 'David Miller', business: 'Restaurant', reward: 'Free Dessert', date: '2023-09-17', points: 250 },
      ]);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // User Growth Chart Data
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 78, 52, 91, 43, 106, 125, 113, 95],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Business Distribution Chart Data
  const businessDistributionData = {
    labels: ['Retail', 'Food & Beverage', 'Services', 'Entertainment', 'Other'],
    datasets: [
      {
        data: [35, 30, 20, 10, 5],
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(107, 114, 128, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Redemption Activity Chart Data
  const redemptionActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Redemptions',
        data: [28, 35, 45, 56, 72, 81, 53],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Overview of the loyalty program system</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Time Range:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-md bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold">{dashboardData.totalUsers}</span>
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        +{dashboardData.newUsersToday} today
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-md bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Store className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Businesses</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold">{dashboardData.totalBusinesses}</span>
                      <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                        {dashboardData.pendingBusinesses} pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-md bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Award className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Redemptions</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold">{dashboardData.totalRedemptions}</span>
                      <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                        {dashboardData.totalRewards} rewards
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold">${dashboardData.revenueGenerated}</span>
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                        generated
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium">User Growth</h2>
              </div>
              <div className="p-4">
                <div className="h-64">
                  <Bar
                    data={userGrowthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium">Business Categories</h2>
              </div>
              <div className="p-4">
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={businessDistributionData}
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
              </div>
            </Card>
            
            <Card className="xl:col-span-3">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium">Redemption Activity</h2>
              </div>
              <div className="p-4">
                <div className="h-64">
                  <Bar
                    data={redemptionActivityData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-medium">Recent Users</h2>
                <Link to="/admin/users" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-800 dark:text-indigo-200">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'customer' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pending Businesses */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-medium">Pending Businesses</h2>
                <Link to="/admin/businesses" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Business
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Applied
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {pendingBusinesses.map((business) => (
                      <tr key={business.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                              <Store className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium">{business.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{business.programsCount} program(s)</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {business.owner}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {business.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {business.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Recent Redemptions */}
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium">Recent Redemptions</h2>
              <Link to="/admin/rewards" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Business
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reward
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {recentRedemptions.map((redemption) => (
                    <tr key={redemption.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {redemption.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {redemption.business}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {redemption.reward}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {redemption.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                        -{redemption.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;