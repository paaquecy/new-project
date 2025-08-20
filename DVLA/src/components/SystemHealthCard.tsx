import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Activity } from 'lucide-react';

interface HealthIndicator {
  id: string;
  label: string;
  status: string;
  statusType: 'operational' | 'normal' | 'warning' | 'error';
}

const SystemHealthCard: React.FC = () => {
  const { darkMode } = useTheme();
  
  const indicators: HealthIndicator[] = [
    {
      id: '1',
      label: 'Database Status:',
      status: 'Operational',
      statusType: 'operational'
    },
    {
      id: '2',
      label: 'API Uptime:',
      status: '99.9%',
      statusType: 'normal'
    },
    {
      id: '3',
      label: 'Queue Processing:',
      status: 'Normal',
      statusType: 'normal'
    }
  ];

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'operational': return 'text-green-600';
      case 'normal': return 'text-blue-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center space-x-2 mb-4">
        <Activity className={`transition-colors duration-200 ${
          darkMode ? 'text-green-400' : 'text-green-500'
        }`} size={20} />
        <h3 className={`text-lg font-semibold transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>System Health Indicators</h3>
      </div>
      
      <div className="space-y-4">
        {indicators.map((indicator) => (
          <div key={indicator.id} className={`flex justify-between items-center py-2 border-b last:border-b-0 transition-colors duration-200 ${
            darkMode ? 'border-gray-700' : 'border-gray-50'
          }`}>
            <span className={`transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>{indicator.label}</span>
            <span className={`font-semibold ${getStatusColor(indicator.statusType)}`}>
              {indicator.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealthCard;