import React from 'react';
import { BarChart, LineChart } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Card from '../../components/ui/Card';
import { useBusiness } from '../../hooks/useBusiness';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reports: React.FC = () => {
  const { business } = useBusiness();

  // Sample data for demonstration
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [3000, 3500, 4200, 4800, 5100, 5600],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const pointsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Points Earned',
        data: [15000, 17500, 21000, 24000, 25500, 28000],
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
      {
        label: 'Points Redeemed',
        data: [12000, 14000, 16800, 19200, 20400, 22400],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
    ],
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">View your business performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Revenue Trend</h2>
            <LineChart className="h-5 w-5 text-gray-400" />
          </div>
          <Line
            data={revenueData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `$${value}`,
                  },
                },
              },
            }}
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Points Activity</h2>
            <BarChart className="h-5 w-5 text-gray-400" />
          </div>
          <Bar
            data={pointsData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </Card>

        <Card className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Key Metrics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Customers</p>
              <p className="text-2xl font-bold text-blue-900">{business?.customers.length || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Active Programs</p>
              <p className="text-2xl font-bold text-green-900">
                {business?.programs.filter(p => p.active).length || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Total Transactions</p>
              <p className="text-2xl font-bold text-purple-900">{business?.transactions.length || 0}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-600 font-medium">Points Issued</p>
              <p className="text-2xl font-bold text-amber-900">
                {business?.transactions
                  .filter(t => t.type === 'purchase')
                  .reduce((sum, t) => sum + t.pointsEarned, 0) || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;