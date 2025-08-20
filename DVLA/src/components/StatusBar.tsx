import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CheckCircle } from 'lucide-react';

interface StatusIndicator {
  id: string;
  label: string;
  status: 'Connected' | 'Disconnected';
}

const StatusBar: React.FC = () => {
  const { darkMode } = useTheme();
  
  const indicators: StatusIndicator[] = [
    { id: '1', label: 'Insurance', status: 'Connected' },
    { id: '2', label: 'Payment Gateway', status: 'Connected' },
    { id: '3', label: 'Gov Database', status: 'Connected' }
  ];

  return (
    <div className={`border-t px-4 sm:px-8 py-3 sm:py-4 transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full transition-colors duration-200 ${
              darkMode 
                ? 'bg-green-900 text-green-300' 
                : 'bg-green-100 text-green-800'
            }`}
          >
            <CheckCircle size={14} className="sm:hidden" />
            <CheckCircle size={16} className="hidden sm:inline" />
            <span className="font-medium text-xs sm:text-sm">
              {indicator.label}: {indicator.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;