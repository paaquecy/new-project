import React from 'react';
import { 
  BarChart3, 
  Car, 
  Flag, 
  AlertTriangle, 
  FileText, 
  Plus,
  Clock,
  CheckCircle,
  Target
} from 'lucide-react';

interface OverviewDashboardProps {
  onNavigate?: (page: string) => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  // Get setActiveNav from parent component via props or context
  // For now, we'll use a placeholder function
  const handleQuickAction = (action: string) => {
    console.log(`Quick action clicked: ${action}`);
    // Navigate to the selected page
    if (onNavigate) {
      onNavigate(action);
    }
  };

  const activityStats = [
    { label: 'Vehicles Scanned', value: 124, icon: Car },
    { label: 'Violations Flagged', value: 32, icon: Flag },
    { label: 'Cases Resolved', value: 28, icon: CheckCircle }
  ];

  const quickActions = [
    { id: 'verify-license', label: 'Verify License', icon: Car },
    { id: 'flagging', label: 'Flag Violation', icon: Flag },
    { id: 'vehicle-info', label: 'Vehicle Lookup', icon: BarChart3 },
    { id: 'field-reporting', label: 'New Report', icon: FileText }
  ];

  const recentActivities = [
    { action: 'Scanned plate GH-1234-20', time: '10 min ago' },
    { action: 'Flagged Overspeeding on AS-5678-21', time: '35 min ago' },
    { action: 'Resolved case for BA-9876-19', time: '1 hour ago' },
    { action: 'Scanned plate GHI 012', time: '2 hours ago' }
  ];

  const pendingViolations = [
    { violation: 'Illegal Parking JKL 345', status: 'Pending' },
    { violation: 'Expired License MNO 678', status: 'Pending' },
    { violation: 'No Insurance PQR 901', status: 'Pending' }
  ];

  const dailyTargets = [
    { label: 'Vehicles Scanned', current: 15, target: 20, percentage: 75 },
    { label: 'Violations Flagged', current: 8, target: 10, percentage: 80 }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Row 1 - Personal Activity Statistics and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Personal Activity Statistics */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
            <BarChart3 className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            Personal Activity Statistics
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
            {activityStats.map((stat, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-3 lg:p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="w-5 lg:w-6 h-5 lg:h-6 text-blue-600" />
                </div>
                <div className="text-xl lg:text-2xl font-bold text-blue-700 mb-1">{stat.value}</div>
                <div className="text-xs lg:text-sm text-blue-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
            <Plus className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            Quick Actions
          </h3>
          
          <div className="space-y-2 lg:space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full flex items-center px-3 lg:px-4 py-2 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <action.icon className="w-3 lg:w-4 h-3 lg:h-4 mr-2 lg:mr-3" />
                <span className="text-xs lg:text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 - Recent Activity and Pending Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
            <Clock className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            Recent Activity
          </h3>
          
          <div className="space-y-3 lg:space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100 last:border-b-0">
                <span className="text-xs lg:text-sm text-gray-700 truncate pr-2">{activity.action}</span>
                <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Violations */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
            <AlertTriangle className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            Pending Violations
          </h3>
          
          <div className="space-y-3 lg:space-y-4">
            {pendingViolations.map((violation, index) => (
              <div key={index} className="space-y-2">
                <div className="text-xs lg:text-sm text-gray-700">{violation.violation}</div>
                <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                  {violation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 - Daily Targets */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-4 lg:mb-6 flex items-center">
          <Target className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
          Daily Targets
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {dailyTargets.map((target, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs lg:text-sm font-medium text-gray-700">{target.label}</span>
                <span className="text-xs lg:text-sm text-gray-600">
                  {target.percentage}% ({target.current}/{target.target})
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
                <div 
                  className="bg-blue-600 h-2 lg:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${target.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewDashboard;
