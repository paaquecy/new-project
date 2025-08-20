import React, { useState, useMemo, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Activity,
  Calendar,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Save,
  Mail
} from 'lucide-react';
import { getAuditLogs, AuditLogEntry as ImportedAuditLogEntry } from '../utils/auditLog';
import EmailNotificationHistory from './EmailNotificationHistory';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

interface SystemHealthItem {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'critical';
  description: string;
}

interface AdministrativeControlsProps {
  onNavigate?: (page: string) => void;
}

const AdministrativeControls: React.FC<AdministrativeControlsProps> = ({ onNavigate }) => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'ROLE001',
      name: 'Administrator',
      description: 'Full access to all system features and settings.',
      permissions: 'All'
    },
    {
      id: 'ROLE002',
      name: 'Moderator',
      description: 'Manage violations and user approvals.',
      permissions: 'View Violations, Resolve Violations, Approve Users'
    },
    {
      id: 'ROLE003',
      name: 'Data Entry',
      description: 'Add and modify vehicle registry data.',
      permissions: 'Add Vehicle, Edit Vehicle, View Registry'
    },
    {
      id: 'ROLE004',
      name: 'Viewer',
      description: 'View reports and system overview.',
      permissions: 'View Dashboard, View Reports'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Edit role modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    permissions: ''
  });

  // Load audit logs from storage
  useEffect(() => {
    const logs = getAuditLogs();
    // Convert to local format and take latest 10 entries
    const formattedLogs = logs.slice(-10).map(log => ({
      id: log.id,
      timestamp: new Date(log.timestamp).toLocaleString(),
      user: log.user,
      action: log.action,
      details: log.details
    }));
    setAuditLogs(formattedLogs);
  }, []);

  const [systemHealth] = useState<SystemHealthItem[]>([
    {
      id: 'SH001',
      name: 'Database Connection',
      status: 'operational',
      description: 'Operational'
    },
    {
      id: 'SH002',
      name: 'API Gateway',
      status: 'operational',
      description: 'Active'
    },
    {
      id: 'SH003',
      name: 'Notification Service',
      status: 'operational',
      description: 'Running'
    },
    {
      id: 'SH004',
      name: 'Disk Usage',
      status: 'warning',
      description: '85% (Warning)'
    },
    {
      id: 'SH005',
      name: 'License Status',
      status: 'operational',
      description: 'Valid until 2025-12-31'
    }
  ]);

  // Filter states for audit log
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesUser = userFilter === '' || 
        log.user.toLowerCase().includes(userFilter.toLowerCase());
      
      const matchesAction = actionFilter === '' ||
        log.action.toLowerCase().includes(actionFilter.toLowerCase());
      
      const matchesDate = dateFilter === '' ||
        log.timestamp.includes(dateFilter);
      
      return matchesUser && matchesAction && matchesDate;
    });
  }, [auditLogs, userFilter, actionFilter, dateFilter]);

  const handleAddNewRole = () => {
    console.log('Add New Role button clicked');
    if (onNavigate) {
      onNavigate('add-new-role');
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteRole = (role: Role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      setRoles(prev => prev.filter(r => r.id !== role.id));
      console.log(`Delete clicked for ${role.name}`);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRole(null);
    setEditForm({ name: '', description: '', permissions: '' });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveRole = () => {
    if (!editingRole) return;

    // Validation
    if (!editForm.name.trim()) {
      alert('Role name is required');
      return;
    }

    if (!editForm.description.trim()) {
      alert('Role description is required');
      return;
    }

    if (!editForm.permissions.trim()) {
      alert('Role permissions are required');
      return;
    }

    // Update the role in the roles array
    setRoles(prev => prev.map(role =>
      role.id === editingRole.id
        ? {
            ...role,
            name: editForm.name.trim(),
            description: editForm.description.trim(),
            permissions: editForm.permissions.trim()
          }
        : role
    ));

    console.log(`Role ${editingRole.name} updated successfully`);
    handleCloseEditModal();
  };

  const handleUserFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFilter(e.target.value);
    console.log('User filter changed to:', e.target.value);
  };

  const handleActionFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActionFilter(e.target.value);
    console.log('Action filter changed to:', e.target.value);
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    console.log('Date filter changed to:', e.target.value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusDot = (status: string) => {
    const baseClasses = "w-3 h-3 rounded-full";
    switch (status) {
      case 'operational':
        return `${baseClasses} bg-green-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-500`;
      case 'critical':
        return `${baseClasses} bg-red-500`;
      default:
        return `${baseClasses} bg-gray-500`;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Role Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserCog className="w-5 h-5 mr-2" />
            Role Management
          </h2>
          <button
            onClick={handleAddNewRole}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add New Role
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROLE NAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DESCRIPTION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PERMISSIONS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map((role, index) => (
                <tr 
                  key={role.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {role.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {role.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {role.permissions}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Edit size={14} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Audit Log</h2>
          </div>
          <button
            onClick={() => onNavigate('audit-log')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Activity className="w-4 h-4 mr-2" />
            View Full Audit Log
          </button>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="Filter by User"
              value={userFilter}
              onChange={handleUserFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Filter by Action"
              value={actionFilter}
              onChange={handleActionFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={handleDateFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="dd/mm/yyyy"
            />
            <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TIMESTAMP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USER
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTION
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DETAILS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAuditLogs.map((log, index) => (
                <tr 
                  key={log.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.user}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {log.action}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      {log.details}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAuditLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audit logs found matching the current filters.
            </div>
          )}
        </div>
      </div>

      {/* System Health Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Activity className="w-5 h-5 mr-2 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">System Health Overview</h2>
        </div>

        <div className="space-y-4">
          {systemHealth.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
              <div className={getStatusDot(item.status)}></div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{item.name}:</span>
                  <span className={`text-sm ${
                    item.status === 'operational' ? 'text-green-600' :
                    item.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {item.description}
                  </span>
                </div>
              </div>
              {getStatusIcon(item.status)}
            </div>
          ))}
        </div>
      </div>

      {/* Email Notification History Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Mail className="w-5 h-5 mr-2 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Email Notification History</h2>
        </div>
        <EmailNotificationHistory />
      </div>

      {/* Edit Role Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Role</h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter role name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter role description"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <textarea
                  value={editForm.permissions}
                  onChange={(e) => handleEditFormChange('permissions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter permissions (comma separated)"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrativeControls;
