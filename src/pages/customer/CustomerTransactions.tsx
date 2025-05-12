import React, { useState, useEffect } from 'react';
import { Search, Filter, Receipt, Tag, Calendar, DollarSign, ShoppingBag, Gift } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

// Mock transaction interface for customer
interface CustomerTransaction {
  id: string;
  businessName: string;
  businessLogo?: string;
  date: string;
  amount: number;
  pointsEarned: number;
  type: 'purchase' | 'redemption';
  status: 'completed' | 'pending';
  description?: string;
}

const CustomerTransactions: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<CustomerTransaction[]>([]);

  // Load customer transactions
  useEffect(() => {
    // Simulate API call to get customer transactions
    const timer = setTimeout(() => {
      // Mock data for customer transactions
      const mockTransactions: CustomerTransaction[] = [
        {
          id: '1',
          businessName: 'Coffee Shop',
          businessLogo: '/logos/coffee-shop.png',
          date: format(new Date(2023, 8, 22), 'MMM d, yyyy'),
          amount: 15.50,
          pointsEarned: 75,
          type: 'purchase',
          status: 'completed',
          description: 'Large latte and sandwich'
        },
        {
          id: '2',
          businessName: 'Bookstore',
          businessLogo: '/logos/bookstore.png',
          date: format(new Date(2023, 8, 18), 'MMM d, yyyy'),
          amount: 42.99,
          pointsEarned: 215,
          type: 'purchase',
          status: 'completed',
          description: 'Fiction books (2)'
        },
        {
          id: '3',
          businessName: 'Coffee Shop',
          businessLogo: '/logos/coffee-shop.png',
          date: format(new Date(2023, 8, 15), 'MMM d, yyyy'),
          amount: 0,
          pointsEarned: 100,
          type: 'redemption',
          status: 'completed',
          description: 'Free dessert'
        },
        {
          id: '4',
          businessName: 'Tech Store',
          businessLogo: '/logos/tech-store.png',
          date: format(new Date(2023, 8, 10), 'MMM d, yyyy'),
          amount: 120.00,
          pointsEarned: 600,
          type: 'purchase',
          status: 'completed',
          description: 'Wireless headphones'
        },
        {
          id: '5',
          businessName: 'Tech Store',
          businessLogo: '/logos/tech-store.png',
          date: format(new Date(2023, 8, 5), 'MMM d, yyyy'),
          amount: 0,
          pointsEarned: 250,
          type: 'redemption',
          status: 'completed',
          description: '$25 discount'
        }
      ];
      
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter transactions when search term or filter changes
  useEffect(() => {
    let filtered = [...transactions];
    
    // Apply transaction type filter
    if (filter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        transaction => 
          transaction.businessName.toLowerCase().includes(term) || 
          (transaction.description && transaction.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Transactions</h1>
        <p className="mt-1 text-sm text-gray-500">View your purchase history and reward redemptions</p>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="inline-flex shadow-sm rounded-md">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              <Filter className="h-4 w-4 mr-1" />
              Type:
            </span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-md"
            >
              <option value="all">All Transactions</option>
              <option value="purchase">Purchases</option>
              <option value="redemption">Redemptions</option>
            </select>
          </div>
        </div>
      </Card>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex flex-col items-center">
          <div className="p-2 rounded-full bg-blue-100 mb-2">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-sm font-medium text-gray-500">Total Transactions</div>
          <div className="text-2xl font-bold">{transactions.length}</div>
        </Card>
        
        <Card className="p-4 flex flex-col items-center">
          <div className="p-2 rounded-full bg-green-100 mb-2">
            <Tag className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-sm font-medium text-gray-500">Points Earned</div>
          <div className="text-2xl font-bold">
            {transactions
              .filter(t => t.type === 'purchase')
              .reduce((sum, t) => sum + t.pointsEarned, 0)}
          </div>
        </Card>
        
        <Card className="p-4 flex flex-col items-center">
          <div className="p-2 rounded-full bg-purple-100 mb-2">
            <Gift className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-sm font-medium text-gray-500">Points Redeemed</div>
          <div className="text-2xl font-bold">
            {transactions
              .filter(t => t.type === 'redemption')
              .reduce((sum, t) => sum + t.pointsEarned, 0)}
          </div>
        </Card>
      </div>
      
      {/* Transaction List */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Loading your transactions...</p>
        </Card>
      ) : filteredTransactions.length > 0 ? (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                    {transaction.type === 'purchase' ? (
                      <ShoppingBag className="h-6 w-6 text-blue-600" />
                    ) : (
                      <Gift className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">{transaction.businessName}</h3>
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'purchase' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {transaction.type === 'purchase' ? 'Purchase' : 'Redemption'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                    {transaction.description && (
                      <p className="text-sm text-gray-700 mt-1">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                  {transaction.type === 'purchase' && (
                    <div className="text-gray-900 font-medium">${transaction.amount.toFixed(2)}</div>
                  )}
                  <div className={`text-sm font-medium ${
                    transaction.type === 'purchase' ? 'text-green-600' : 'text-purple-600'
                  }`}>
                    {transaction.type === 'purchase' ? '+' : '-'}{transaction.pointsEarned} points
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {filter !== 'all' 
              ? `You don't have any ${filter} transactions yet.` 
              : "You haven't made any transactions yet. Visit participating businesses to start earning points!"}
          </p>
        </Card>
      )}
    </div>
  );
};

export default CustomerTransactions; 