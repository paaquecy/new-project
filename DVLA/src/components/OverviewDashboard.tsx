import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import StatCard from './StatCard';
import ActivityCard from './ActivityCard';
import ExpirationCard from './ExpirationCard';
import DataQualityCard from './DataQualityCard';
import SystemHealthCard from './SystemHealthCard';
import StatusBar from './StatusBar';
import { Car, Plus, RefreshCw } from 'lucide-react';

const OverviewDashboard: React.FC = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Top Row - Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Total Registrations"
          value="1,234,567"
          icon={Car}
          iconColor="text-blue-500"
        />
        <StatCard
          title="New Registrations (Today)"
          value="1,234"
          icon={Plus}
          iconColor="text-green-500"
        />
        <StatCard
          title="Pending Renewals"
          value="5,678"
          icon={RefreshCw}
          iconColor="text-orange-500"
        />
      </div>

      {/* Middle Row - Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <ActivityCard />
        <ExpirationCard />
        <DataQualityCard />
      </div>

      {/* Bottom Row - System Health */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <SystemHealthCard />
      </div>
    </div>
  );
};

export default OverviewDashboard;