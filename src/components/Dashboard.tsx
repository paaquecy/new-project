import React from 'react';
import {
  Car,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  Calendar,
  BarChart3,
  Bell
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DashboardProps {
  darkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ darkMode }) => {
  const kpiData = [
    {
      value: '1,234',
      label: 'Total Vehicles Scanned',
      icon: Car,
      color: 'text-blue-600'
    },
    {
      value: '45',
      label: 'Active Violations',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      value: '987',
      label: 'Resolved Violations',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      value: '+12%',
      label: 'Monthly Growth',
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  const monthlyGrowthData = [
    { month: 'Jan', vehicles: 850, violations: 78, resolvedViolations: 72 },
    { month: 'Feb', vehicles: 920, violations: 85, resolvedViolations: 80 },
    { month: 'Mar', vehicles: 1050, violations: 92, resolvedViolations: 88 },
    { month: 'Apr', vehicles: 1180, violations: 105, resolvedViolations: 98 },
    { month: 'May', vehicles: 1320, violations: 118, resolvedViolations: 112 },
    { month: 'Jun', vehicles: 1450, violations: 132, resolvedViolations: 125 },
    { month: 'Jul', vehicles: 1580, violations: 145, resolvedViolations: 138 },
    { month: 'Aug', vehicles: 1720, violations: 158, resolvedViolations: 152 },
    { month: 'Sep', vehicles: 1850, violations: 172, resolvedViolations: 165 },
    { month: 'Oct', vehicles: 1980, violations: 185, resolvedViolations: 178 },
    { month: 'Nov', vehicles: 2120, violations: 198, resolvedViolations: 191 },
    { month: 'Dec', vehicles: 2250, violations: 212, resolvedViolations: 205 }
  ];

  const recentActivities = [
    { description: 'Vehicle OT-2387-21 scanned.', time: '2 min ago' },
    { description: 'Violation flagged for BA-1387-18.', time: '15 min ago' },
    { description: 'Vehicle GA-2887-22 scanned.', time: '1 hour ago' },
    { description: 'Violation resolved for ER-2886-24.', time: '3 hours ago' },
    { description: 'New user registration: Sarah Wilson.', time: '5 hours ago' },
    { description: 'Vehicle GT-2686-22 scanned.', time: '6 hours ago' }
  ];

  const upcomingDeadlines = [
    { violationId: '#1012', plateNumber: 'OT-2387-21', dueDate: '24/07/2024' },
    { violationId: '#1015', plateNumber: 'GA-2887-22', dueDate: '28/07/2024' },
    { violationId: '#1018', plateNumber: 'GHI-789', dueDate: '01/08/2024' },
    { violationId: '#1021', plateNumber: 'GW-1786-14', dueDate: '05/08/2024' }
  ];

  const pendingApprovals = [
    { name: 'John Mensah', email: 'john.doe@example.com' },
    { name: 'Afia Willson', email: 'jane.smith@example.com' },
    { name: 'Peter Osei ', email: 'peter.jones@example.com' },
    { name: 'Sarah Wilson', email: 'sarah.wilson@example.com' }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{kpi.label}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50 ${kpi.color}`}>
                  <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity Feed */}
        <div className={`rounded-lg shadow-sm border p-4 sm:p-6 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center mb-4">
            <Clock className={`w-5 h-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <h2 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity Feed</h2>
          </div>
          <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
            {recentActivities.map((activity, index) => (
              <div key={index} className={`flex items-start space-x-3 p-3 rounded-md transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-50'
              }`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activity.description}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className={`rounded-lg shadow-sm border p-4 sm:p-6 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center mb-4">
            <Calendar className={`w-5 h-5 mr-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <h2 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Deadlines</h2>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-md border transition-colors ${
                darkMode 
                  ? 'border-gray-600 hover:bg-gray-700' 
                  : 'border-gray-100 hover:bg-gray-50'
              }`}>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Violation {deadline.violationId} ({deadline.plateNumber})
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Due: {deadline.dueDate}</p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Performance Metrics</h2>
          </div>
          <div className="h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Chart: Monthly Growth & Trends</p>
              <p className="text-sm text-gray-400 mt-1">Chart visualization will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Pending Approval Alerts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Pending Approval Alerts</h2>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((approval, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-md border border-gray-100 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    New user account: {approval.name}
                  </p>
                  <p className="text-xs text-gray-500">{approval.email}</p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                  Pending
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              View All Pending Approvals →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
