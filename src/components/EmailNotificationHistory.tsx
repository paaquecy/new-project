import React, { useState, useEffect } from 'react';
import { getEmailNotificationHistory, clearEmailNotificationHistory } from '../utils/emailService';

interface EmailNotification {
  id: string;
  timestamp: string;
  type: 'approval' | 'rejection';
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  status: string;
}

const EmailNotificationHistory: React.FC = () => {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'approval' | 'rejection'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const history = getEmailNotificationHistory();
    setNotifications(history);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all email notification history? This action cannot be undone.')) {
      clearEmailNotificationHistory();
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesSearch = searchQuery === '' || 
      notification.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeBadge = (type: 'approval' | 'rejection') => {
    return (
      <span className={`
        inline-flex px-2 py-1 text-xs font-semibold rounded-full
        ${type === 'approval' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
        }
      `}>
        {type === 'approval' ? 'Approval' : 'Rejection'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Email Notification History
          </h2>
          <button
            onClick={handleClearHistory}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'approval' | 'rejection')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="approval">Approvals</option>
              <option value="rejection">Rejections</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No email notifications found.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotifications.map((notification, index) => (
                <tr 
                  key={notification.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(notification.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {notification.recipientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {notification.recipientEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={notification.subject}>
                      {notification.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(notification.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {notification.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
      )}
    </div>
  );
};

export default EmailNotificationHistory;
