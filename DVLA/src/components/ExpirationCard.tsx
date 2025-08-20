import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AlertTriangle } from 'lucide-react';

interface Expiration {
  id: string;
  description: string;
  date: string;
  urgency: 'high' | 'medium' | 'low';
}

const ExpirationCard: React.FC = () => {
  const { darkMode } = useTheme();
  
  const expirations: Expiration[] = [
    {
      id: '1',
      description: 'Vehicle GHI012 registration expires in 7 days.',
      date: '2024-07-15',
      urgency: 'medium'
    },
    {
      id: '2',
      description: 'License JKL345 expires in 3 days.',
      date: '2024-07-11',
      urgency: 'high'
    },
    {
      id: '3',
      description: 'Vehicle MNO678 insurance expires today.',
      date: '2024-07-08',
      urgency: 'high'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className={`transition-colors duration-200 ${
          darkMode ? 'text-orange-400' : 'text-orange-500'
        }`} size={20} />
        <h3 className={`text-lg font-semibold transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Expiration Alerts</h3>
      </div>
      
      <div className="space-y-4">
        {expirations.map((expiration) => (
          <div key={expiration.id} className={`flex justify-between items-start py-2 border-b last:border-b-0 transition-colors duration-200 ${
            darkMode ? 'border-gray-700' : 'border-gray-50'
          }`}>
            <p className={`flex-1 pr-4 transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>{expiration.description}</p>
            <span className={`text-sm px-2 py-1 rounded-full font-medium ${getUrgencyColor(expiration.urgency)}`}>
              {expiration.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpirationCard;