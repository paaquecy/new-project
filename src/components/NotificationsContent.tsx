import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Bell,
  BellOff,
  Trash2,
  Archive,
  Check
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'violation' | 'approval' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const NotificationsContent: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'violation',
      title: 'New Violation Alert',
      description: 'Vehicle ABC-123 detected in restricted zone. Review required.',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'approval',
      title: 'User Approval Required',
      description: 'Officer Jane Doe (Badge: P-456) is pending approval for system access.',
      timestamp: '4 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'violation',
      title: 'High Priority Violation',
      description: 'Vehicle XYZ-789 flagged for multiple violations. Immediate action required.',
      timestamp: '6 hours ago',
      read: false,
    },
    {
      id: '4',
      type: 'approval',
      title: 'Approval Confirmed',
      description: 'Pending approval for user "John Smith" has been processed and approved.',
      timestamp: 'Yesterday',
      read: true,
    },
    {
      id: '5',
      type: 'system',
      title: 'System Update',
      description: 'New features and bug fixes deployed. See release notes for details.',
      timestamp: '2 days ago',
      read: true,
    },
    {
      id: '6',
      type: 'violation',
      title: 'Violation Review Complete',
      description: 'Violation case #V-2024-001 has been reviewed and closed.',
      timestamp: '3 days ago',
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'violation':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'violation':
        return 'Violation';
      case 'approval':
        return 'Approval';
      case 'system':
        return 'System';
      default:
        return 'Info';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'violation':
        return 'bg-red-100 text-red-800';
      case 'approval':
        return 'bg-green-100 text-green-800';
      case 'system':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="mr-3 h-8 w-8 text-blue-600" />
              Notifications
            </h1>
            <p className="text-gray-600 mt-2">Stay updated with real-time alerts and system messages</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Stats and Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'read'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
              notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50/50'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-sm font-semibold ${notification.read ? 'text-gray-800' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(notification.type)}`}>
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>
                      <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
                        {notification.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 sm:ml-2 flex-shrink-0">
                      {notification.timestamp}
                    </span>
                  </div>
                  
                  {!notification.read && (
                    <div className="flex items-center mt-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-xs text-blue-600 font-medium">New</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <BellOff className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? "No read notifications to display."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive email alerts for critical violations and approvals</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">System Notifications</h3>
              <p className="text-sm text-gray-600">Receive alerts about system updates and maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsContent;
