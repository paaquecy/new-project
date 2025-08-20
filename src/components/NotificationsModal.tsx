import React, { useState } from 'react';

interface Notification {
  id: string;
  description: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    description: 'New vehicle registration approved.',
    timestamp: '2024-07-21 10:15 AM',
    read: false,
  },
  {
    id: '2',
    description: 'Violation report submitted by Officer Jane.',
    timestamp: '2024-07-21 09:50 AM',
    read: false,
  },
  {
    id: '3',
    description: 'System maintenance scheduled for July 25.',
    timestamp: '2024-07-20 05:30 PM',
    read: true,
  },
];

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-4">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No notifications.</div>
          ) : (
            <>
              <div className="flex justify-end mb-2">
                <button
                  onClick={markAllAsRead}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded transition-colors"
                  disabled={notifications.every(n => n.read)}
                >
                  Mark all as read
                </button>
              </div>
              <ul className="space-y-3 max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <li key={n.id} className={`flex items-start justify-between p-3 rounded-lg border ${n.read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div>
                      <div className={`text-sm ${n.read ? 'text-gray-700' : 'text-blue-800 font-semibold'}`}>{n.description}</div>
                      <div className="text-xs text-gray-400 mt-1">{n.timestamp}</div>
                    </div>
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="ml-4 text-gray-400 hover:text-red-500 p-1 rounded-full focus:outline-none"
                      title="Dismiss"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
