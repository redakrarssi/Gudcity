/**
 * This file has been updated to fix build issues on production.
 * Ensure proper error boundaries are in place.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, UserPlus, Mail, Phone } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useBusiness } from '../../hooks/useBusiness';
import { Customer } from '../../contexts/BusinessContext';
// Import build fix utility
import { fixBuild } from '../../utils/buildFix';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const Customers: React.FC = () => {
  // Call the build fix utility
  useEffect(() => {
    fixBuild();
  }, []);

  const { business, addCustomer } = useBusiness();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Simulate loading and error handling
    try {
      setIsLoading(true);
      // Check if the business context is available
      if (business) {
        setIsLoading(false);
      } else {
        // After 3 seconds with no business data, set a timeout
        const timer = setTimeout(() => {
          if (!business) {
            console.warn("Business data not available after timeout");
            setIsLoading(false);
          }
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("Error loading Customers component:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setIsLoading(false);
    }
  }, [business]);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    }
  });
  
  const onSubmit = (data: CustomerFormValues) => {
    const currentDate = new Date();
    const formatDate = (date: Date) => format(date, 'MMM d, yyyy');
    
    const newCustomer: Customer = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      dateJoined: formatDate(currentDate),
      points: 0,
      visits: 0,
      totalSpent: 0,
      lastVisit: formatDate(currentDate),
    };
    
    addCustomer(newCustomer);
    setIsModalOpen(false);
    reset();
  };
  
  const filteredCustomers = business?.customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  ) || [];
  
  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <Card className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Error Loading Customers</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {error.message || "There was a problem loading the customer data. Please try refreshing the page."}
          </p>
          <div className="mt-6">
            <Button 
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your loyalty program members</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                variant="primary"
                leftIcon={<PlusCircle className="h-5 w-5" />}
                onClick={() => setIsModalOpen(true)}
              >
                Add Customer
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
                  placeholder="Search customers..."
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
          
          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visits
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spent
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Visit
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {customer.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.dateJoined}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{customer.points}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.visits}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${customer.totalSpent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastVisit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
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
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No customers yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Add your first customer to start building your loyalty program membership.
              </p>
              <div className="mt-6">
                <Button 
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Your First Customer
                </Button>
              </div>
            </Card>
          )}
          
          {/* Add Customer Modal */}
          <Dialog 
            open={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            className="fixed z-10 inset-0 overflow-y-auto"
          >
            <div className="flex items-center justify-center min-h-screen">
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              
              <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
                  Add New Customer
                </Dialog.Title>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      id="name"
                      placeholder="e.g., John Doe"
                      fullWidth
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    
                    <Input
                      label="Email Address"
                      id="email"
                      type="email"
                      placeholder="e.g., john@example.com"
                      fullWidth
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    
                    <Input
                      label="Phone Number"
                      id="phone"
                      placeholder="e.g., 555-123-4567"
                      fullWidth
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
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
                    >
                      Add Customer
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Customers;