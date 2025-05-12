import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, BadgeDollarSign, Receipt, Calendar, DollarSign } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useBusiness } from '../../hooks/useBusiness';
import { formatCurrency } from '../../utils/formatters';

const TransactionDetail: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { business } = useBusiness();
  
  const transaction = business?.transactions.find(t => t.id === transactionId);
  
  if (!transaction) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Transaction not found</h2>
        <p className="mt-2 text-gray-600">The transaction you're looking for doesn't exist or has been removed.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/dashboard/transactions')}
        >
          Back to Transactions
        </Button>
      </div>
    );
  }
  
  // Find the associated customer
  const customer = business?.customers.find(c => c.id === transaction.customerId);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/transactions')}
            size="sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Transaction Details
            </h1>
            <p className="text-sm text-gray-500">Transaction ID: {transaction.id.substring(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/dashboard/customers/${transaction.customerId}`)}
          >
            View Customer
          </Button>
        </div>
      </div>
      
      {/* Transaction Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Transaction Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.type === 'purchase' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {transaction.type === 'purchase' ? 'Purchase' : 'Redemption'}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-gray-900">{transaction.date}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-gray-900 font-medium">{formatCurrency(transaction.amount)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <BadgeDollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Points</p>
                <p className={`font-medium ${
                  transaction.type === 'purchase' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {transaction.type === 'purchase' ? '+' : '-'}{transaction.pointsEarned} points
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="md:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
          
          {customer ? (
            <div>
              <div className="flex items-start gap-3 mb-6">
                <div className="bg-gray-100 h-12 w-12 rounded-full flex items-center justify-center text-gray-600 font-medium text-lg">
                  {customer.name.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                  {customer.phone && <p className="text-sm text-gray-500">{customer.phone}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Total Points</p>
                  <p className="text-xl font-bold text-blue-600">{customer.points}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Total Visits</p>
                  <p className="text-xl font-bold text-gray-900">{customer.visits}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(customer.totalSpent || 0)}</p>
                </div>
              </div>
              
              <div className="mt-6 text-right">
                <Button 
                  variant="outline" 
                  leftIcon={<User className="h-4 w-4" />}
                  onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
                >
                  View Full Customer Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <User className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Customer information not available</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetail; 