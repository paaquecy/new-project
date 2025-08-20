import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  AlertTriangle, 
  Users, 
  Car, 
  BarChart, 
  Shield, 
  Settings, 
  Cog, 
  Search, 
  Bell, 
  User, 
  LogOut,
  CheckCircle,
  Info
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'violation' | 'approval' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate, currentPage }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'violation',
      title: 'Violation Alert',
      description: 'Vehicle ABC-123 detected in restricted zone. Review required.',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'approval',
      title: 'Approval Confirmed',
      description: 'Pending approval for user \'Jane Doe\' has been processed.',
      timestamp: 'Yesterday',
      read: false,
    },
    {
      id: '3',
      type: 'system',
      title: 'System Update',
      description: 'New features and bug fixes deployed. See release notes for details.',
      timestamp: '3 days ago',
      read: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
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

  const navigationItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'pending-approvals', label: 'Pending Approvals', icon: Clock },
    { id: 'violation-management', label: 'Violation Management', icon: AlertTriangle },
    { id: 'user-accounts', label: 'User Account Management', icon: Users },
    { id: 'vehicle-registry', label: 'Data Entry & Vehicle Registration', icon: Car },
    { id: 'analytics', label: 'Analytics & Reporting', icon: BarChart },
    { id: 'security', label: 'Security Management', icon: Shield },
    { id: 'admin-controls', label: 'Administrative Controls', icon: Settings },
    { id: 'system-settings', label: 'System Settings', icon: Cog },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-['Inter']">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Plate Recognition</h1>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile and Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">AU Admin User</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">John Doe</span>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Notifications Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Mark all as read
            </button>
          </div>

          {/* Notification List */}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border p-4 transition-colors ${
                  notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">{notification.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
