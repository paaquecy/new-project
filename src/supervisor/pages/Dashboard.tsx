import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle, XCircle, FileText, TrendingUp } from 'lucide-react';
import { getUpdatedDashboardStats } from '../data/mockData';

const Dashboard: React.FC = () => {
  const stats = getUpdatedDashboardStats();

  const pieData = [
    { name: 'Accepted', value: stats.accepted, color: '#10B981' },
    { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' }
  ];

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }> = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and review traffic violations submitted today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Violations Today"
          value={stats.totalToday}
          icon={FileText}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Violations Accepted"
          value={stats.accepted}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Violations Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pending}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Weekly Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Weekly Overview</h2>
          </div>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="accepted" fill="#10B981" name="Accepted" />
              <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Decision Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Today's Decision Distribution</h2>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Clock className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Review Pending</h3>
            <p className="text-sm text-gray-600">Review {stats.pending} pending violations</p>
          </button>
          <button className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">View Accepted</h3>
            <p className="text-sm text-gray-600">See {stats.accepted} accepted violations</p>
          </button>
          <button className="p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Generate Report</h3>
            <p className="text-sm text-gray-600">Export daily summary report</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;