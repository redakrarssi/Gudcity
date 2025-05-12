import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Award, 
  Gift, 
  Calendar, 
  Store, 
  Edit2, 
  Trash2,
  Plus,
  Check,
  X,
  Eye,
  Clock,
  Tag,
  DollarSign
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Reward {
  id: string;
  name: string;
  description: string;
  business: {
    id: string;
    name: string;
  };
  pointsRequired: number;
  redemptionCount: number;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'expired' | 'draft' | 'scheduled';
  isGlobal: boolean;
}

const RewardsManagement: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newReward, setNewReward] = useState<Partial<Reward>>({
    name: '',
    description: '',
    business: { id: '', name: '' },
    pointsRequired: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    status: 'draft',
    isGlobal: false
  });
  
  // Load rewards data
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // Mock data
      const mockRewards = [
        { 
          id: '1', 
          name: 'Free Coffee', 
          description: 'Get a free coffee of your choice', 
          business: { id: '1', name: 'Coffee Corner' },
          pointsRequired: 100,
          redemptionCount: 45,
          startDate: '2023-06-01',
          endDate: null,
          status: 'active',
          isGlobal: false
        },
        { 
          id: '2', 
          name: '15% Book Discount', 
          description: '15% off any book purchase', 
          business: { id: '2', name: 'Book Haven' },
          pointsRequired: 150,
          redemptionCount: 23,
          startDate: '2023-07-15',
          endDate: '2023-10-15',
          status: 'active',
          isGlobal: false
        },
        { 
          id: '3', 
          name: 'Free Personal Training Session', 
          description: 'One free 30-minute personal training session', 
          business: { id: '3', name: 'Fitness First' },
          pointsRequired: 250,
          redemptionCount: 12,
          startDate: '2023-08-01',
          endDate: '2023-09-01',
          status: 'expired',
          isGlobal: false
        },
        { 
          id: '4', 
          name: 'Device Screen Protector', 
          description: 'Free screen protector for your device', 
          business: { id: '4', name: 'Tech World' },
          pointsRequired: 120,
          redemptionCount: 67,
          startDate: '2023-05-10',
          endDate: null,
          status: 'active',
          isGlobal: false
        },
        { 
          id: '5', 
          name: 'Seasonal Sale Early Access', 
          description: 'Get early access to our seasonal sale', 
          business: { id: '6', name: 'Fancy Fashion' },
          pointsRequired: 200,
          redemptionCount: 0,
          startDate: '2023-11-01',
          endDate: '2023-11-07',
          status: 'scheduled',
          isGlobal: false
        },
        { 
          id: '6', 
          name: 'Platform Birthday Gift', 
          description: 'Special gift for our platform anniversary', 
          business: { id: 'global', name: 'System' },
          pointsRequired: 50,
          redemptionCount: 156,
          startDate: '2023-10-01',
          endDate: '2023-10-31',
          status: 'active',
          isGlobal: true
        },
      ] as Reward[];
      
      setRewards(mockRewards);
      setFilteredRewards(mockRewards);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter rewards when search term or status filter changes
  useEffect(() => {
    let filtered = [...rewards];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'global') {
        filtered = filtered.filter(reward => reward.isGlobal);
      } else {
        filtered = filtered.filter(reward => reward.status === statusFilter && !reward.isGlobal);
      }
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        reward => reward.name.toLowerCase().includes(term) || 
                  reward.description.toLowerCase().includes(term) ||
                  reward.business.name.toLowerCase().includes(term)
      );
    }
    
    setFilteredRewards(filtered);
  }, [rewards, searchTerm, statusFilter]);
  
  // Handle reward actions
  const toggleRewardStatus = (rewardId: string) => {
    setRewards(prevRewards => 
      prevRewards.map(reward => 
        reward.id === rewardId ? { 
          ...reward, 
          status: reward.status === 'active' ? 'expired' : 'active' 
        } : reward
      )
    );
  };
  
  const viewRewardDetails = (reward: Reward) => {
    setSelectedReward(reward);
    setShowRewardModal(true);
  };
  
  const editReward = (reward: Reward) => {
    setSelectedReward(reward);
    setNewReward({
      name: reward.name,
      description: reward.description,
      business: { ...reward.business },
      pointsRequired: reward.pointsRequired,
      startDate: reward.startDate,
      endDate: reward.endDate,
      status: reward.status,
      isGlobal: reward.isGlobal
    });
    setIsEditMode(true);
    setShowRewardModal(true);
  };
  
  const createNewReward = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    setSelectedReward(null);
    setNewReward({
      name: '',
      description: '',
      business: { id: '', name: '' },
      pointsRequired: 100,
      startDate: currentDate,
      endDate: null,
      status: 'draft',
      isGlobal: false
    });
    setIsEditMode(false);
    setShowRewardModal(true);
  };
  
  const saveReward = () => {
    if (!newReward.name || !newReward.description || !newReward.business?.id) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (isEditMode && selectedReward) {
      // Update existing reward
      setRewards(prevRewards => 
        prevRewards.map(reward => 
          reward.id === selectedReward.id 
            ? { 
                ...reward,
                name: newReward.name || '',
                description: newReward.description || '',
                business: newReward.business as Reward['business'],
                pointsRequired: newReward.pointsRequired || 0,
                startDate: newReward.startDate || '',
                endDate: newReward.endDate,
                status: newReward.status as Reward['status'],
                isGlobal: newReward.isGlobal || false
              } 
            : reward
        )
      );
      toast.success('Reward updated successfully!');
    } else {
      // Add new reward
      const newId = `reward-${Date.now()}`;
      const rewardToAdd: Reward = {
        id: newId,
        name: newReward.name || '',
        description: newReward.description || '',
        business: newReward.business as Reward['business'],
        pointsRequired: newReward.pointsRequired || 0,
        redemptionCount: 0,
        startDate: newReward.startDate || '',
        endDate: newReward.endDate,
        status: newReward.status as Reward['status'],
        isGlobal: newReward.isGlobal || false
      };
      
      setRewards(prevRewards => [...prevRewards, rewardToAdd]);
      toast.success('Reward created successfully!');
    }
    
    setShowRewardModal(false);
  };
  
  // Status badge component
  const StatusBadge = ({ status, isGlobal }: { status: Reward['status']; isGlobal: boolean }) => {
    let bgColor, textColor, icon;
    
    if (isGlobal) {
      bgColor = 'bg-purple-100 dark:bg-purple-900';
      textColor = 'text-purple-800 dark:text-purple-200';
      icon = <Tag className="h-4 w-4 mr-1" />;
      return (
        <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
          {icon}
          Global
        </span>
      );
    }
    
    switch(status) {
      case 'active':
        bgColor = 'bg-green-100 dark:bg-green-900';
        textColor = 'text-green-800 dark:text-green-200';
        icon = <Check className="h-4 w-4 mr-1" />;
        break;
      case 'expired':
        bgColor = 'bg-red-100 dark:bg-red-900';
        textColor = 'text-red-800 dark:text-red-200';
        icon = <X className="h-4 w-4 mr-1" />;
        break;
      case 'draft':
        bgColor = 'bg-gray-100 dark:bg-gray-900';
        textColor = 'text-gray-800 dark:text-gray-200';
        icon = <Edit2 className="h-4 w-4 mr-1" />;
        break;
      case 'scheduled':
        bgColor = 'bg-blue-100 dark:bg-blue-900';
        textColor = 'text-blue-800 dark:text-blue-200';
        icon = <Calendar className="h-4 w-4 mr-1" />;
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
          <h1 className="text-2xl font-bold">Rewards & Offers</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage all rewards and loyalty offers</p>
        </div>
        <Button 
          variant="primary"
          onClick={createNewReward}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Reward</span>
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
            placeholder="Search rewards by name or business..."
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
                  <option value="all">All Rewards</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                  <option value="global">Global Rewards</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rewards Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reward
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Business
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Points
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Redeemed
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
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredRewards.length > 0 ? (
                filteredRewards.map(reward => (
                  <tr key={reward.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                          <Gift className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">{reward.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{reward.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {reward.isGlobal ? (
                          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Global Reward</span>
                        ) : (
                          <div className="flex items-center">
                            <Store className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm">{reward.business.name}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium">{reward.pointsRequired}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={reward.status} isGlobal={reward.isGlobal} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{reward.startDate} {reward.endDate ? ` to ${reward.endDate}` : ' (no end date)'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {reward.redemptionCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => editReward(reward)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit reward"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => viewRewardDetails(reward)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleRewardStatus(reward.id)}
                          className={`${
                            reward.status === 'active' 
                              ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300' 
                              : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                          }`}
                          title={reward.status === 'active' ? 'Deactivate reward' : 'Activate reward'}
                        >
                          {reward.status === 'active' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No rewards found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Reward Details Modal */}
      {showRewardModal && (
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
                    <Gift className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-headline">
                      {isEditMode ? 'Edit Reward' : 'Add New Reward'}
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="rewardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reward Name*
                        </label>
                        <input
                          type="text"
                          id="rewardName"
                          value={newReward.name}
                          onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="e.g. Free Coffee"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="rewardDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description*
                        </label>
                        <textarea
                          id="rewardDescription"
                          rows={3}
                          value={newReward.description}
                          onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="Describe the reward"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Business*
                        </label>
                        <select
                          id="businessSelect"
                          value={newReward.business?.id}
                          onChange={(e) => {
                            const businessId = e.target.value;
                            let businessName = '';
                            
                            if (businessId === 'global') {
                              businessName = 'System';
                              setNewReward({
                                ...newReward, 
                                business: { id: businessId, name: businessName },
                                isGlobal: true
                              });
                            } else {
                              // In a real app, you would look up the business name from your businesses list
                              const mockBusinesses = [
                                { id: '1', name: 'Coffee Corner' },
                                { id: '2', name: 'Book Haven' },
                                { id: '3', name: 'Fitness First' },
                                { id: '4', name: 'Tech World' },
                              ];
                              
                              const selectedBusiness = mockBusinesses.find(b => b.id === businessId);
                              businessName = selectedBusiness?.name || '';
                              
                              setNewReward({
                                ...newReward, 
                                business: { id: businessId, name: businessName },
                                isGlobal: false
                              });
                            }
                          }}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value="">Select a business</option>
                          <option value="1">Coffee Corner</option>
                          <option value="2">Book Haven</option>
                          <option value="3">Fitness First</option>
                          <option value="4">Tech World</option>
                          <option value="global">Global (System-wide)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="pointsRequired" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Points Required*
                        </label>
                        <input
                          type="number"
                          id="pointsRequired"
                          min="1"
                          value={newReward.pointsRequired}
                          onChange={(e) => setNewReward({...newReward, pointsRequired: parseInt(e.target.value, 10)})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Start Date*
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            value={newReward.startDate}
                            onChange={(e) => setNewReward({...newReward, startDate: e.target.value})}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            End Date (Optional)
                          </label>
                          <input
                            type="date"
                            id="endDate"
                            value={newReward.endDate || ''}
                            onChange={(e) => setNewReward({...newReward, endDate: e.target.value || null})}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </label>
                        <select
                          id="status"
                          value={newReward.status}
                          onChange={(e) => setNewReward({...newReward, status: e.target.value as Reward['status']})}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value="draft">Draft</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={saveReward}
                >
                  {isEditMode ? 'Save Changes' : 'Add Reward'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowRewardModal(false)}
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

export default RewardsManagement; 