import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Lock, 
  Unlock, 
  Plus, 
  X, 
  Check,
  CreditCard,
  History,
  Shield
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'business' | 'staff' | 'admin';
  status: 'active' | 'blocked';
  points: number;
  createdAt: string;
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [pointsReason, setPointsReason] = useState<string>('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('permanent');
  const [showBanModal, setShowBanModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'customer' as 'customer' | 'business' | 'staff' | 'admin',
    points: 0
  });
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Load user data
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // Mock data
      const mockUsers = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'customer', status: 'active', points: 250, createdAt: '2023-03-15', lastActive: '2023-09-20' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'customer', status: 'active', points: 450, createdAt: '2023-05-22', lastActive: '2023-09-18' },
        { id: '3', name: 'Robert Johnson', email: 'robert@example.com', role: 'business', status: 'active', points: 0, createdAt: '2023-01-10', lastActive: '2023-09-21' },
        { id: '4', name: 'Emily Davis', email: 'emily@example.com', role: 'customer', status: 'blocked', points: 120, createdAt: '2023-06-05', lastActive: '2023-08-15' },
        { id: '5', name: 'Michael Brown', email: 'michael@example.com', role: 'staff', status: 'active', points: 0, createdAt: '2023-02-18', lastActive: '2023-09-22' },
        { id: '6', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'admin', status: 'active', points: 0, createdAt: '2022-11-30', lastActive: '2023-09-22' },
      ] as User[];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter users when search term or filter changes
  useEffect(() => {
    let filtered = [...users];
    
    // Apply role filter
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.role === filter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user => user.name.toLowerCase().includes(term) || 
                user.email.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, filter]);
  
  // Handle user actions
  const toggleUserStatus = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' } 
          : user
      )
    );
    
    const user = users.find(u => u.id === userId);
    if (user) {
      toast.success(`User ${user.name} has been ${user.status === 'active' ? 'blocked' : 'unblocked'}`);
    }
  };
  
  const openPointsModal = (user: User) => {
    setSelectedUser(user);
    setPointsToAdd(0);
    setPointsReason('');
    setShowPointsModal(true);
  };
  
  const handleAddPoints = () => {
    if (selectedUser && pointsToAdd) {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, points: user.points + pointsToAdd } 
            : user
        )
      );
      setShowPointsModal(false);
      toast.success(`Added ${pointsToAdd} points to ${selectedUser.name}'s account`);
    }
  };
  
  const openBanModal = (user: User) => {
    setSelectedUser(user);
    setBanReason('');
    setBanDuration('permanent');
    setShowBanModal(true);
  };
  
  const handleBanUser = () => {
    if (selectedUser) {
      // In a real app, you would send this information to your backend
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, status: 'blocked' } 
            : user
        )
      );
      setShowBanModal(false);
      toast.success(`User ${selectedUser.name} has been banned for ${banDuration === 'permanent' ? 'permanently' : banDuration}`);
    }
  };
  
  const editUser = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points
    });
    setIsEditMode(true);
    setShowAddUserModal(true);
  };

  const handleAddUser = () => {
    if (isEditMode && selectedUser) {
      // Update existing user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                name: newUser.name, 
                email: newUser.email, 
                role: newUser.role, 
                points: newUser.points 
              } 
            : user
        )
      );
      toast.success(`User ${newUser.name} has been updated!`);
    } else {
      // Add new user
      const newUserId = `user-${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      const userToAdd: User = {
        id: newUserId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
        points: newUser.role === 'customer' ? newUser.points : 0,
        createdAt: currentDate,
        lastActive: currentDate
      };
      
      setUsers(prevUsers => [...prevUsers, userToAdd]);
      toast.success(`User ${newUser.name} has been added!`);
    }
    
    // Reset form and close modal
    setNewUser({
      name: '',
      email: '',
      role: 'customer',
      points: 0
    });
    setIsEditMode(false);
    setSelectedUser(null);
    setShowAddUserModal(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">View and manage all users in the system</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add User</span>
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
            placeholder="Search users by name or email..."
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
                  Role:
                </span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-md"
                >
                  <option value="all">All Users</option>
                  <option value="customer">Customers</option>
                  <option value="business">Businesses</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <Card>
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
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Points
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
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
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                          : user.role === 'staff'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : user.role === 'business'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.role === 'customer' ? (
                        <button
                          onClick={() => openPointsModal(user)}
                          className="flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <span>{user.points}</span>
                          <Plus className="h-4 w-4 ml-1" />
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastActive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => editUser(user)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit user"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {user.role === 'customer' && (
                          <button
                            onClick={() => {}}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View history"
                          >
                            <History className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`${
                            user.status === 'active' 
                              ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300' 
                              : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                          }`}
                          title={user.status === 'active' ? 'Block user' : 'Unblock user'}
                        >
                          {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                        
                        {user.status === 'active' && (
                          <button
                            onClick={() => openBanModal(user)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Ban user"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Add/Edit User Modal */}
      {showAddUserModal && (
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
                    <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-headline">
                      {isEditMode ? 'Edit User' : 'Add New User'}
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name
                        </label>
                        <input
                          type="text"
                          id="userName"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="Enter full name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          id="userEmail"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="user@example.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Role
                        </label>
                        <select
                          id="userRole"
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value="customer">Customer</option>
                          <option value="business">Business</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      
                      {newUser.role === 'customer' && (
                        <div>
                          <label htmlFor="userPoints" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Starting Points
                          </label>
                          <input
                            type="number"
                            id="userPoints"
                            min="0"
                            value={newUser.points}
                            onChange={(e) => setNewUser({...newUser, points: parseInt(e.target.value, 10)})}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          />
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
                  onClick={handleAddUser}
                  disabled={!newUser.name || !newUser.email}
                >
                  {isEditMode ? 'Save Changes' : 'Add User'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setIsEditMode(false);
                    setNewUser({
                      name: '',
                      email: '',
                      role: 'customer',
                      points: 0
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Points Modal */}
      {showPointsModal && selectedUser && (
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
                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-headline">
                      Add Points to {selectedUser.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current points: {selectedUser.points}
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="pointsToAdd" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Points to Add
                        </label>
                        <input
                          type="number"
                          id="pointsToAdd"
                          min="1"
                          value={pointsToAdd}
                          onChange={(e) => setPointsToAdd(parseInt(e.target.value, 10))}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="pointsReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reason (Optional)
                        </label>
                        <input
                          type="text"
                          id="pointsReason"
                          value={pointsReason}
                          onChange={(e) => setPointsReason(e.target.value)}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                          placeholder="e.g., Special promotion, Manual adjustment"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddPoints}
                  disabled={!pointsToAdd || pointsToAdd <= 0}
                >
                  Add Points
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPointsModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
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
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-headline">
                      Ban User: {selectedUser.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Banning this user will prevent them from accessing the platform. This action can be reversed later.
                      </p>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="banReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reason for Ban
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="banReason"
                            name="banReason"
                            rows={3}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 rounded-md"
                            placeholder="Describe why this user is being banned"
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="banDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ban Duration
                        </label>
                        <select
                          id="banDuration"
                          name="banDuration"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:border-gray-700 dark:bg-gray-900"
                          value={banDuration}
                          onChange={(e) => setBanDuration(e.target.value)}
                        >
                          <option value="24h">24 Hours</option>
                          <option value="3d">3 Days</option>
                          <option value="7d">7 Days</option>
                          <option value="30d">30 Days</option>
                          <option value="permanent">Permanent</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleBanUser}
                >
                  Ban User
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowBanModal(false)}
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

export default UserManagement; 