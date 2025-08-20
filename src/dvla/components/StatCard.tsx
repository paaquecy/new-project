import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-blue-500' 
}) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium mb-2 transition-colors duration-200 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{title}</p>
          <p className={`text-3xl font-bold transition-colors duration-200 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg transition-colors duration-200 ${
          darkMode ? 'bg-gray-700' : 'bg-gray-50'
        } ${iconColor}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;