import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  Car,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { userAccountService, UserAccount } from '../services/userAccountService';

interface UserAccountManagementProps {
  currentUserId?: string; // ID of the currently logged-in admin
  searchQuery?: string; // Search query from parent component
}

const UserAccountManagement: React.FC<UserAccountManagementProps> = ({ currentUserId }) => {
  const [pendingUsers, setPendingUsers] = useState<UserAccount[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showApproved, setShowApproved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'police' | 'dvla'>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [userToReject, setUserToReject] = useState<UserAccount | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        userAccountService.getPendingUsers(),
        userAccountService.getApprovedUsers()
      ]);
      setPendingUsers(pending);
      setApprovedUsers(approved);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (user: UserAccount) => {
    if (!currentUserId) return;

    try {
      const result = await userAccountService.approveUser(user.id, currentUserId);
      if (result.success) {
        alert('User approved successfully!');
        await loadUsers();
      } else {
        alert(`Failed to approve user: ${result.message}`);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('An error occurred while approving the user');
    }
  };

  const handleRejectUser = async () => {
    if (!userToReject || !currentUserId || !rejectionReason.trim()) return;

    try {
      const result = await userAccountService.rejectUser(
        userToReject.id,
        rejectionReason.trim(),
        currentUserId
      );
      if (result.success) {
        alert('User rejected successfully');
        await loadUsers();
        setShowRejectionModal(false);
        setUserToReject(null);
        setRejectionReason('');
      } else {
        alert(`Failed to reject user: ${result.message}`);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('An error occurred while rejecting the user');
    }
  };

  const openRejectionModal = (user: UserAccount) => {
    setUserToReject(user);
    setShowRejectionModal(true);
  };

  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setUserToReject(null);
    setRejectionReason('');
  };

  const filteredUsers = (showApproved ? approvedUsers : pendingUsers).filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.badge_number && user.badge_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.id_number && user.id_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === 'all' || user.account_type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getUserUsername = (user: UserAccount): string => {
    return user.account_type === 'police' 
      ? user.badge_number || 'N/A'
      : user.id_number || 'N/A';
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 text-blue-600" size={28} />
            User Account Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage user registrations and account approvals
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="text-orange-500" size={16} />
              <span className="font-medium">{pendingUsers.length} Pending</span>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle className="text-green-500" size={16} />
              <span className="font-medium">{approvedUsers.length} Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowApproved(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showApproved
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Approvals ({pendingUsers.length})
            </button>
            <button
              onClick={() => setShowApproved(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showApproved
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Approved Users ({approvedUsers.length})
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'police' | 'dvla')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="police">Police Officers</option>
              <option value="dvla">DVLA Officers</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="grid gap-6">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {showApproved ? 'approved' : 'pending'} users found
            </h3>
            <p className="text-gray-600">
              {showApproved 
                ? 'No approved users match your search criteria'
                : 'No pending registrations at this time'
              }
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Account Type Icon */}
                  <div className={`p-3 rounded-lg ${
                    user.account_type === 'police' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {user.account_type === 'police' ? <Shield size={24} /> : <Car size={24} />}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.account_type === 'police'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.account_type.toUpperCase()} OFFICER
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail size={16} className="mr-2" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone size={16} className="mr-2" />
                        {user.telephone}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        Applied: {formatDate(user.created_at)}
                      </div>
                    </div>

                    {/* Role-specific Info */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {user.account_type === 'police' ? (
                        <>
                          <div>
                            <span className="font-medium text-gray-700">Badge:</span>
                            <span className="ml-1 text-gray-600">{user.badge_number}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Rank:</span>
                            <span className="ml-1 text-gray-600">{user.rank}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Station:</span>
                            <span className="ml-1 text-gray-600">{user.station}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="font-medium text-gray-700">ID Number:</span>
                            <span className="ml-1 text-gray-600">{user.id_number}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Position:</span>
                            <span className="ml-1 text-gray-600">{user.position}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Approval Info for approved users */}
                    {showApproved && user.approved_at && (
                      <div className="mt-3 text-sm text-green-600">
                        <CheckCircle size={16} className="inline mr-2" />
                        Approved on {formatDate(user.approved_at)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!showApproved && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproveUser(user)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <UserCheck size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => openRejectionModal(user)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <UserX size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectionModal && userToReject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Reject User Account</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject the account for{' '}
              <span className="font-medium">{userToReject.first_name} {userToReject.last_name}</span>?
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRejectUser}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reject Account
              </button>
              <button
                onClick={closeRejectionModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
