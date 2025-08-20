import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

const ActivityCard: React.FC = () => {
  const { darkMode } = useTheme();
  
  const activities: Activity[] = [
    {
      id: '1',
      description: 'Vehicle ABC123 registered by John Smith.',
      timestamp: '5 min ago'
    },
    {
      id: '2',
      description: 'Removal processed for XY2793.',
      timestamp: '1 hour ago'
    },
    {
      id: '3',
      description: 'Data updated for vehicle DEF456.',
      timestamp: '3 hours ago'
    },
    {
      id: '4',
      description: 'New user account created: Jane Doe.',
      timestamp: 'Yesterday'
    }
  ];

  return (
    <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="text-blue-500" size={20} />
        <h3 className={`text-lg font-semibold transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Recent Activity Feed</h3>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className={`flex justify-between items-start py-2 border-b last:border-b-0 transition-colors duration-200 ${
            darkMode ? 'border-gray-700' : 'border-gray-50'
          }`}>
            <p className={`flex-1 pr-4 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>{activity.description}</p>
            <span className={`text-sm whitespace-nowrap transition-colors duration-200 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{activity.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityCard;