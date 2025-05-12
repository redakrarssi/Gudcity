import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Store, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  Plus,
  Check,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Business {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected' | 'suspended';
  programsCount: number;
  customersCount: number;
  createdAt: string;
}

const BusinessManagement: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [newBusiness, setNewBusiness] = useState<Partial<Business>>({
    name: '',
    owner: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    status: 'pending',
    programsCount: 0,
    customersCount: 0
  });
  
  // Load business data
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // Mock data
      const mockBusinesses = [
        { 
          id: '1', 
          name: 'Coffee Corner', 
          owner: 'Sarah Miller', 
          email: 'info@coffeecorner.com', 
          phone: '(555) 123-4567', 
          address: '123 Main St, City, State',
          category: 'Food & Beverage',
          status: 'approved',
          programsCount: 2,
          customersCount: 145,
          createdAt: '2023-03-10',
        },
        { 
          id: '2', 
          name: 'Book Haven', 
          owner: 'Michael Brown', 
          email: 'contact@bookhaven.com', 
          phone: '(555) 234-5678', 
          address: '456 Oak St, City, State',
          category: 'Retail',
          status: 'pending',
          programsCount: 1,
          customersCount: 0,
          createdAt: '2023-09-14',
        },
        { 
          id: '3', 
          name: 'Fitness First', 
          owner: 'Jessica White', 
          email: 'info@fitnessfirst.com', 
          phone: '(555) 345-6789', 
          address: '789 Pine St, City, State',
          category: 'Health & Fitness',
          status: 'pending',
          programsCount: 1,
          customersCount: 0,
          createdAt: '2023-09-12',
        },
        { 
          id: '4', 
          name: 'Tech World', 
          owner: 'Robert Johnson', 
          email: 'support@techworld.com', 
          phone: '(555) 456-7890', 
          address: '101 Elm St, City, State',
          category: 'Electronics',
          status: 'approved',
          programsCount: 3,
          customersCount: 267,
          createdAt: '2023-01-15',
        },
        { 
          id: '5', 
          name: 'Green Garden', 
          owner: 'Emma Davis', 
          email: 'info@greengarden.com', 
          phone: '(555) 567-8901', 
          address: '202 Maple St, City, State',
          category: 'Home & Garden',
          status: 'suspended',
          programsCount: 1,
          customersCount: 78,
          createdAt: '2023-02-20',
        },
        { 
          id: '6', 
          name: 'Fancy Fashion', 
          owner: 'David Wilson', 
          email: 'contact@fancyfashion.com', 
          phone: '(555) 678-9012', 
          address: '303 Birch St, City, State',
          category: 'Clothing',
          status: 'rejected',
          programsCount: 0,
          customersCount: 0,
          createdAt: '2023-08-05',
        },
      ] as Business[];
      
      setBusinesses(mockBusinesses);
      setFilteredBusinesses(mockBusinesses);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter businesses when search term or status filter changes
  useEffect(() => {
    let filtered = [...businesses];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(business => business.status === statusFilter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        business => business.name.toLowerCase().includes(term) || 
                    business.owner.toLowerCase().includes(term) ||
                    business.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredBusinesses(filtered);
  }, [businesses, searchTerm, statusFilter]);
  
  // Handle business actions
  const openApprovalModal = (business: Business) => {
    setSelectedBusiness(business);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };
  
  const handleApprove = () => {
    if (selectedBusiness) {
      setBusinesses(prevBusinesses => 
        prevBusinesses.map(business => 
          business.id === selectedBusiness.id 
            ? { ...business, status: 'approved' } 
            : business
        )
      );
      setShowApprovalModal(false);
    }
  };
  
  const handleReject = () => {
    if (selectedBusiness) {
      setBusinesses(prevBusinesses => 
        prevBusinesses.map(business => 
          business.id === selectedBusiness.id 
            ? { ...business, status: 'rejected' } 
            : business
        )
      );
      setShowApprovalModal(false);
    }
  };
  
  const toggleSuspension = (businessId: string) => {
    setBusinesses(prevBusinesses => 
      prevBusinesses.map(business => 
        business.id === businessId 
          ? { 
              ...business, 
              status: business.status === 'suspended' ? 'approved' : 'suspended' 
            } 
          : business
      )
    );
  };
  
  const editBusiness = (business: Business) => {
    setSelectedBusiness(business);
    setNewBusiness({
      name: business.name,
      owner: business.owner,
      email: business.email,
      phone: business.phone,
      address: business.address,
      category: business.category,
      status: business.status
    });
    setIsEditMode(true);
    setShowBusinessModal(true);
  };
  
  const createNewBusiness = () => {
    setSelectedBusiness(null);
    setNewBusiness({
      name: '',
      owner: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      status: 'pending',
      programsCount: 0,
      customersCount: 0
    });
    setIsEditMode(false);
    setShowBusinessModal(true);
  };
  
  const saveBusiness = () => {
    if (!newBusiness.name || !newBusiness.owner || !newBusiness.email) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (isEditMode && selectedBusiness) {
      // Update existing business
      setBusinesses(prevBusinesses => 
        prevBusinesses.map(business => 
          business.id === selectedBusiness.id 
            ? { 
                ...business,
                name: newBusiness.name || '',
                owner: newBusiness.owner || '',
                email: newBusiness.email || '',
                phone: newBusiness.phone || '',
                address: newBusiness.address || '',
                category: newBusiness.category || '',
                status: newBusiness.status as Business['status']
              } 
            : business
        )
      );
      toast.success(`Business ${newBusiness.name} updated successfully!`);
    } else {
      // Add new business
      const newId = `business-${Date.now()}`;
      const businessToAdd: Business = {
        id: newId,
        name: newBusiness.name || '',
        owner: newBusiness.owner || '',
        email: newBusiness.email || '',
        phone: newBusiness.phone || '',
        address: newBusiness.address || '',
        category: newBusiness.category || '',
        status: 'pending',
        programsCount: 0,
        customersCount: 0,
        createdAt: currentDate
      };
      
      setBusinesses(prevBusinesses => [...prevBusinesses, businessToAdd]);
      toast.success(`Business ${newBusiness.name} added successfully!`);
    }
    
    setShowBusinessModal(false);
  };
  
  // Status badge component
  const StatusBadge = ({ status }: { status: Business['status'] }) => {
    let bgColor, textColor, icon;
    
    switch(status) {
      case 'approved':
        bgColor = 'bg-green-100 dark:bg-green-900';
        textColor = 'text-green-800 dark:text-green-200';
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case 'pending':
        bgColor = 'bg-yellow-100 dark:bg-yellow-900';
        textColor = 'text-yellow-800 dark:text-yellow-200';
        icon = <AlertCircle className="h-4 w-4 mr-1" />;
        break;
      case 'rejected':
        bgColor = 'bg-red-100 dark:bg-red-900';
        textColor = 'text-red-800 dark:text-red-200';
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
      case 'suspended':
        bgColor = 'bg-orange-100 dark:bg-orange-900';
        textColor = 'text-orange-800 dark:text-orange-200';
        icon = <AlertCircle className="h-4 w-4 mr-1" />;
        break;
    }
    
    return (
      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Business Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Approve and manage business listings</p>
        </div>
        <Button 
          variant="primary"
          onClick={createNewBusiness}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Business</span>
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search businesses by name or owner..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex">
          <div className="relative inline-block text-left">
            <div className="flex">
              <div className="inline-flex shadow-sm rounded-md">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-md"
                >
                  <option value="all">All Businesses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Businesses Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner / Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Programs / Customers
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                // Loading placeholders
                Array(5).fill(0).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredBusinesses.length > 0 ? (
                filteredBusinesses.map(business => (
                  <tr key={business.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Store className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{business.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{business.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{business.owner}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{business.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{business.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {business.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={business.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{business.programsCount} Programs</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{business.customersCount} Customers</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => editBusiness(business)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit business"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/dashboard/businesses/${business.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View business"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {business.status === 'approved' && (
                          <button
                            onClick={() => toggleSuspension(business.id)}
                            className={`${
                              business.status === 'suspended' 
                                ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300' 
                                : 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300'
                            }`}
                            title={business.status === 'suspended' ? 'Reactivate business' : 'Suspend business'}
                          >
                            {business.status === 'suspended' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </button>
                        )}
                        {(business.status === 'pending' || business.status === 'rejected') && (
                          <button
                            onClick={() => openApprovalModal(business)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Review business"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No businesses found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Add/Edit Business Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div 
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="modal-headline"
            >
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-headline">
                      {isEditMode ? 'Edit Business' : 'Add New Business'}
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business Name*
                        </label>
                        <input
                          type="text"
                          id="businessName"
                          value={newBusiness.name}
                          onChange={(e) => setNewBusiness({...newBusiness, name: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="e.g. Coffee Corner"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessOwner" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Owner Name*
                        </label>
                        <input
                          type="text"
                          id="businessOwner"
                          value={newBusiness.owner}
                          onChange={(e) => setNewBusiness({...newBusiness, owner: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="e.g. John Smith"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address*
                        </label>
                        <input
                          type="email"
                          id="businessEmail"
                          value={newBusiness.email}
                          onChange={(e) => setNewBusiness({...newBusiness, email: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="e.g. contact@business.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          id="businessPhone"
                          value={newBusiness.phone}
                          onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="e.g. (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address
                        </label>
                        <input
                          type="text"
                          id="businessAddress"
                          value={newBusiness.address}
                          onChange={(e) => setNewBusiness({...newBusiness, address: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="e.g. 123 Main St, City, State"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category
                        </label>
                        <select
                          id="businessCategory"
                          value={newBusiness.category}
                          onChange={(e) => setNewBusiness({...newBusiness, category: e.target.value})}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value="">Select a category</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Retail">Retail</option>
                          <option value="Health & Fitness">Health & Fitness</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Home & Garden">Home & Garden</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      {isEditMode && (
                        <div>
                          <label htmlFor="businessStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                          </label>
                          <select
                            id="businessStatus"
                            value={newBusiness.status}
                            onChange={(e) => setNewBusiness({...newBusiness, status: e.target.value as Business['status']})}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:border-gray-700 dark:bg-gray-900"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={saveBusiness}
                >
                  {isEditMode ? 'Save Changes' : 'Add Business'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowBusinessModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Approval Modal */}
      {showApprovalModal && selectedBusiness && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900 dark:opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div 
              className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="modal-headline"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Store className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium" id="modal-headline">
                      Review Business Application
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Reviewing {selectedBusiness.name} owned by {selectedBusiness.owner}
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <div className="text-sm mb-1 font-medium">Business Details</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500 dark:text-gray-400">Category:</div>
                          <div>{selectedBusiness.category}</div>
                          <div className="text-gray-500 dark:text-gray-400">Phone:</div>
                          <div>{selectedBusiness.phone}</div>
                          <div className="text-gray-500 dark:text-gray-400">Email:</div>
                          <div>{selectedBusiness.email}</div>
                          <div className="text-gray-500 dark:text-gray-400">Address:</div>
                          <div>{selectedBusiness.address}</div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes (optional)
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                            placeholder="Add any notes about this decision"
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleApprove}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleReject}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowApprovalModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessManagement; 