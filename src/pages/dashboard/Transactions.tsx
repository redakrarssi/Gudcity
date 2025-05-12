import React, { useState } from 'react';
import { PlusCircle, Search, Filter, Receipt, BadgeDollarSign, Calendar, DollarSign } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useBusiness } from '../../hooks/useBusiness';
import { Transaction } from '../../contexts/BusinessContext';

const transactionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['purchase', 'redemption']),
});

const Transactions: React.FC = () => {
  const { business, addTransaction } = useBusiness();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      customerId: '',
      amount: 0,
      type: 'purchase',
    }
  });
  
  const selectedType = watch('type');
  const selectedCustomerId = watch('customerId');
  const amount = watch('amount');
  
  const selectedCustomer = business?.customers.find(c => c.id === selectedCustomerId);
  
  const calculatePoints = (amount: number) => {
    // Simple points calculation based on amount spent
    // In a real app, this would use the active loyalty program rules
    return Math.floor(amount * 5); // 5 points per dollar
  };
  
  const onSubmit = (data: any) => {
    const currentDate = new Date();
    const formatDate = (date: Date) => format(date, 'MMM d, yyyy');
    
    const pointsEarned = data.type === 'purchase' 
      ? calculatePoints(data.amount) 
      : data.pointsRedeemed || 0;
    
    const newTransaction: Transaction = {
      id: uuidv4(),
      customerId: data.customerId,
      customerName: selectedCustomer?.name || 'Unknown',
      date: formatDate(currentDate),
      amount: data.amount,
      pointsEarned: pointsEarned,
      type: data.type,
    };
    
    addTransaction(newTransaction);
    setIsModalOpen(false);
    reset();
  };
  
  const filteredTransactions = business?.transactions.filter(transaction => 
    transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">Record purchases and reward redemptions</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary"
            leftIcon={<PlusCircle className="h-5 w-5" />}
            onClick={() => setIsModalOpen(true)}
          >
            New Transaction
          </Button>
        </div>
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
          <Button
            variant="outline"
            leftIcon={<Filter className="h-5 w-5" />}
          >
            Filter
          </Button>
        </div>
      </Card>
      
      {filteredTransactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'purchase' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type === 'purchase' ? 'Purchase' : 'Redemption'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date}
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => navigate(`/dashboard/transactions/${transaction.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Record your first transaction to start tracking customer activity.
          </p>
          <div className="mt-6">
            <Button 
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Record Your First Transaction
            </Button>
          </div>
        </Card>
      )}
      
      {/* New Transaction Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
            <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
              Record New Transaction
            </Dialog.Title>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <div className="mt-1 flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        value="purchase"
                        {...register('type')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Purchase</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-blue-600"
                        value="redemption"
                        {...register('type')}
                      />
                      <span className="ml-2 text-sm text-gray-700">Redemption</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <select
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    {...register('customerId')}
                  >
                    <option value="">Select a customer</option>
                    {business?.customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.points} points)
                      </option>
                    ))}
                  </select>
                  {errors.customerId?.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
                  )}
                </div>
                
                <Input
                  label={selectedType === 'purchase' ? 'Purchase Amount' : 'Redemption Value'}
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  leftIcon={<DollarSign className="h-5 w-5 text-gray-400" />}
                  fullWidth
                  error={errors.amount?.message}
                  {...register('amount', { valueAsNumber: true })}
                />
                
                {selectedType === 'purchase' && amount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Points to be earned:</span> {calculatePoints(amount)}
                    </p>
                  </div>
                )}
                
                {selectedType === 'redemption' && selectedCustomer && (
                  <div className={`${
                    selectedCustomer.points >= calculatePoints(amount)
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  } border rounded p-3`}>
                    <p className="text-sm">
                      <span className="font-medium">Current points balance:</span> {selectedCustomer.points}
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Points required:</span> {calculatePoints(amount)}
                    </p>
                    {selectedCustomer.points < calculatePoints(amount) && (
                      <p className="text-sm mt-1 font-medium">
                        Not enough points available!
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={
                    selectedType === 'redemption' && 
                    selectedCustomer && 
                    selectedCustomer.points < calculatePoints(amount)
                  }
                >
                  {selectedType === 'purchase' ? 'Record Purchase' : 'Process Redemption'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Transactions;