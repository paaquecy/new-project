import React, { useState, useMemo } from 'react';
import { ChevronDown, Plus, Edit, UserCheck, UserX, UserPlus, X, Save, Download } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import type { User } from '../utils/dataStorage';

interface UserAccountManagementProps {
  searchQuery: string;
}

const UserAccountManagement: React.FC<UserAccountManagementProps> = ({ searchQuery }) => {
  const {
    users,
    updateUser,
    addUser,
    deleteUser,
    isLoading,
    exportAllData,
    addNotification
  } = useData();

  const [nameEmailFilter, setNameEmailFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesNameEmail = nameEmailFilter === '' ||
        user.name.toLowerCase().includes(nameEmailFilter.toLowerCase()) ||
        user.email.toLowerCase().includes(nameEmailFilter.toLowerCase()) ||
        user.username.toLowerCase().includes(nameEmailFilter.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      const matchesSystem = systemFilter === 'all' || user.system === systemFilter;

      return matchesSearch && matchesNameEmail && matchesRole && matchesStatus && matchesSystem;
    });
  }, [users, searchQuery, nameEmailFilter, roleFilter, statusFilter, systemFilter]);

  const handleNameEmailFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameEmailFilter(e.target.value);
    console.log('Name/Email filter:', e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    console.log('Role filter:', e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    console.log('Status filter:', e.target.value);
  };

  const handleSystemFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSystemFilter(e.target.value);
    console.log('System filter:', e.target.value);
  };

  const handleAddNewUser = () => {
    // For now, just show a placeholder alert
    // In a real app, this would open a form modal
    alert('Add New User functionality would open a form here');
  };

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      updateUser(editingUser);
      addNotification({
        title: 'User Updated',
        message: `User ${editingUser.name} has been updated successfully`,
        type: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        system: 'Main App'
      });
      setIsEditModalOpen(false);
      setEditingUser(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleDeactivate = (user: User) => {
    const updatedUser = { ...user, status: 'inactive' as const };
    updateUser(updatedUser);
    addNotification({
      title: 'User Deactivated',
      message: `User ${user.name} has been deactivated`,
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      system: 'Main App'
    });
  };

  const handleActivate = (user: User) => {
    const updatedUser = { ...user, status: 'active' as const };
    updateUser(updatedUser);
    addNotification({
      title: 'User Activated',
      message: `User ${user.name} has been activated`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      system: 'Main App'
    });
  };

  const handleApprove = (user: User) => {
    const updatedUser = {
      ...user,
      status: 'active' as const,
      lastLogin: new Date().toLocaleString()
    };
    updateUser(updatedUser);
    addNotification({
      title: 'User Approved',
      message: `User ${user.name} has been approved and activated`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      system: 'Main App'
    });
  };

  const handleExportData = () => {
    exportAllData();
    addNotification({
      title: 'Data Exported',
      message: 'System data has been exported successfully',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      system: 'Main App'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full uppercase";
    
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";

    switch (role) {
      case 'Admin':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'Police Officer':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'DVLA Officer':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Supervisor':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'Operator':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Viewer':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getSystemBadge = (system: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";

    switch (system) {
      case 'Main App':
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case 'Police App':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'DVLA App':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Supervisor App':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const renderActionButtons = (user: User) => {
    const baseButtonClasses = "px-3 py-1 text-sm rounded-md transition-colors font-medium";
    
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => handleEdit(user)}
          className={`${baseButtonClasses} bg-blue-600 text-white hover:bg-blue-700 flex items-center`}
        >
          <Edit size={14} className="mr-1" />
          Edit
        </button>
        
        {user.status === 'active' && (
          <button
            onClick={() => handleDeactivate(user)}
            className={`${baseButtonClasses} bg-red-600 text-white hover:bg-red-700 flex items-center`}
          >
            <UserX size={14} className="mr-1" />
            Deactivate
          </button>
        )}
        
        {user.status === 'inactive' && (
          <button
            onClick={() => handleActivate(user)}
            className={`${baseButtonClasses} bg-green-600 text-white hover:bg-green-700 flex items-center`}
          >
            <UserCheck size={14} className="mr-1" />
            Activate
          </button>
        )}
        
        {user.status === 'pending' && (
          <button
            onClick={() => handleApprove(user)}
            className={`${baseButtonClasses} bg-green-600 text-white hover:bg-green-700 flex items-center`}
          >
            <UserPlus size={14} className="mr-1" />
            Approve
          </button>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading user data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Filter Bar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Filter by Name/Email/Username..."
                value={nameEmailFilter}
                onChange={handleNameEmailFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={handleRoleFilterChange}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Police Officer">Police Officer</option>
                <option value="DVLA Officer">DVLA Officer</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Operator">Operator</option>
                <option value="Viewer">Viewer</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={systemFilter}
                onChange={handleSystemFilterChange}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Systems</option>
                <option value="Main App">Main App</option>
                <option value="Police App">Police App</option>
                <option value="DVLA App">DVLA App</option>
                <option value="Supervisor App">Supervisor App</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center"
            >
              <Download size={16} className="mr-2" />
              Export Data
            </button>
            <button
              onClick={handleAddNewUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add New User
            </button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                USER ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                USERNAME
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NAME
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                EMAIL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ROLE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SYSTEM
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                STATUS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LAST LOGIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr 
                key={user.id}
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{user.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">
                    {user.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getRoleBadge(user.role)}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getSystemBadge(user.system)}>
                    {user.system}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(user.status)}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.lastLogin || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {renderActionButtons(user)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching the current filters.
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value as User['role']})}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Police Officer">Police Officer</option>
                    <option value="DVLA Officer">DVLA Officer</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Operator">Operator</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System
                </label>
                <div className="relative">
                  <select
                    value={editingUser.system}
                    onChange={(e) => setEditingUser({...editingUser, system: e.target.value as User['system']})}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Main App">Main App</option>
                    <option value="Police App">Police App</option>
                    <option value="DVLA App">DVLA App</option>
                    <option value="Supervisor App">Supervisor App</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({...editingUser, status: e.target.value as User['status']})}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountManagement;
