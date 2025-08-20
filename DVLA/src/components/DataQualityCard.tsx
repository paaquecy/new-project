import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart3 } from 'lucide-react';

interface QualityMetric {
  id: string;
  label: string;
  percentage: string;
  status: 'good' | 'warning' | 'error';
}

const DataQualityCard: React.FC = () => {
  const { darkMode } = useTheme();
  
  const metrics: QualityMetric[] = [
    {
      id: '1',
      label: 'Incomplete Records:',
      percentage: '2.5%',
      status: 'warning'
    },
    {
      id: '2',
      label: 'Data Entry Errors:',
      percentage: '0.1%',
      status: 'good'
    },
    {
      id: '3',
      label: 'Duplicate Entries:',
      percentage: '0.05%',
      status: 'good'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className={`rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className={`transition-colors duration-200 ${
          darkMode ? 'text-purple-400' : 'text-purple-500'
        }`} size={20} />
        <h3 className={`text-lg font-semibold transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Data Quality Metrics</h3>
      </div>
      
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className={`flex justify-between items-center py-2 border-b last:border-b-0 transition-colors duration-200 ${
            darkMode ? 'border-gray-700' : 'border-gray-50'
          }`}>
            <span className={`transition-colors duration-200 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>{metric.label}</span>
            <span className={`font-semibold ${getStatusColor(metric.status)}`}>
              {metric.percentage}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataQualityCard;