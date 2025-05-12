import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash, Mail, Phone, Calendar, BadgeDollarSign, Receipt } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useBusiness } from '../../hooks/useBusiness';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerDetail: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { business } = useBusiness();
  
  const customer = business?.customers.find(c => c.id === customerId);
  
  // Get customer's transactions
  const customerTransactions = business?.transactions.filter(t => t.customerId === customerId) || [];
  
  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
        <p className="mt-2 text-gray-600">The customer you're looking for doesn't exist or has been removed.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/dashboard/customers')}
        >
          Back to Customers
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/customers')}
            size="sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">Customer since {customer.dateJoined}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Edit Customer
          </Button>
          <Button 
            variant="danger"
            leftIcon={<Trash className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
      
      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{customer.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{customer.phone || "Not provided"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Visit</p>
                <p className="text-gray-900">{customer.lastVisit || "No visits yet"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-md">
                <BadgeDollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-gray-900">{formatCurrency(customer.totalSpent || 0)}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="md:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Loyalty Status</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Total Points</p>
              <p className="text-2xl font-bold text-blue-600">{customer.points}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Visits</p>
              <p className="text-2xl font-bold text-green-600">{customer.visits}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Rewards Redeemed</p>
              <p className="text-2xl font-bold text-purple-600">
                {customerTransactions.filter(t => t.type === 'redemption').length}
              </p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Active Programs</p>
              <p className="text-2xl font-bold text-amber-600">2</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-900 mb-3">Recent Activity</h3>
            
            {customerTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerTransactions.slice(0, 5).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'purchase' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.type === 'purchase' ? 'Purchase' : 'Redemption'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            transaction.type === 'purchase' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {transaction.type === 'purchase' ? '+' : '-'}{transaction.pointsEarned}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {customerTransactions.length > 5 && (
                  <div className="py-3 text-center">
                    <Button variant="outline" className="text-blue-600 hover:text-blue-800">View all transactions</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <Receipt className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">No transactions recorded for this customer yet.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDetail; 