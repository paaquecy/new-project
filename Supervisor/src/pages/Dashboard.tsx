import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, CheckCircle, XCircle, FileText, TrendingUp, AlertCircle, Calendar, Activity, ArrowRight, Eye, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUpdatedDashboardStats } from '../data/mockData';
import { unifiedAPI } from '../lib/unified-api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const stats = getUpdatedDashboardStats();
  
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending violations (same as PendingViolations page)
        const pendingResponse = await unifiedAPI.getViolations(undefined, 'pending');
        if (pendingResponse.data) {
          const transformedPending = pendingResponse.data.map(v => ({
            id: v.id,
            plateNumber: v.plate_number,
            offense: v.violation_type,
            location: v.location || 'Location not specified',
            date: v.created_at ? new Date(v.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
            dateTime: v.created_at,
            officer: `Officer ${v.officer_id || 'Unknown'}`,
            status: v.status,
            fine: v.fine_amount || 100,
            description: v.violation_details
          }));
          setPendingApprovals(transformedPending.slice(0, 5)); // Show only top 5
        }

        // Fetch recent activity from all systems
        const activityResponse = await unifiedAPI.getViolations();
        if (activityResponse.data) {
          const activities = activityResponse.data
            .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
            .slice(0, 8) // Show last 8 activities
            .map(v => ({
              id: v.id,
              type: 'violation',
              title: `${v.violation_type} - ${v.plate_number}`,
              description: `${v.violation_details || 'Traffic violation'} at ${v.location || 'Unknown location'}`,
              timestamp: v.created_at,
              source: v.officer_id ? 'Police' : 'System',
              status: v.status,
              plateNumber: v.plate_number
            }));
          setRecentActivity(activities);
        }

        // Generate upcoming deadlines (30-day limit for violations)
        const allViolationsResponse = await unifiedAPI.getViolations();
        if (allViolationsResponse.data) {
          const now = new Date();
          const deadlines = allViolationsResponse.data
            .filter(v => v.status === 'approved' || v.status === 'pending') // Only approved/pending violations have deadlines
            .map(v => {
              const createdDate = new Date(v.created_at || now);
              const deadlineDate = new Date(createdDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from creation
              const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
              
              return {
                id: v.id,
                title: `Payment Due - ${v.plate_number}`,
                description: `${v.violation_type} fine payment`,
                dueDate: deadlineDate,
                daysLeft,
                amount: v.fine_amount || 100,
                priority: daysLeft <= 7 ? 'high' : daysLeft <= 14 ? 'medium' : 'low'
              };
            })
            .filter(d => d.daysLeft > 0) // Only show future deadlines
            .sort((a, b) => a.daysLeft - b.daysLeft) // Sort by most urgent first
            .slice(0, 5); // Show top 5
          
          setUpcomingDeadlines(deadlines);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const handleViewAllPending = () => {
    navigate('/pending-violations');
  };

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

      {/* Pending Approval Alerts - Same data as Pending Approvals page */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            Pending Approval Alerts ({pendingApprovals.length})
          </h2>
          <button
            onClick={handleViewAllPending}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
          >
            View All Pending Approvals
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : pendingApprovals.length > 0 ? (
          <div className="space-y-3">
            {pendingApprovals.map((violation) => (
              <div key={violation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-semibold text-gray-900">{violation.plateNumber}</span>
                      <span className="text-gray-600">•</span>
                      <span className="font-medium text-gray-900">{violation.offense}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {violation.officer}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {violation.location}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {violation.date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleViewAllPending}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No pending approvals</p>
        )}
      </div>

      {/* Charts and Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Weekly Bar Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
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
          <div className="flex flex-wrap justify-center gap-3 mt-4">
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

      {/* Recent Activity Feed and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity Feed</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-4 border-purple-200 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                      <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-gray-500">{activity.source}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{deadline.title}</h4>
                      <p className="text-gray-600 text-xs mt-1">{deadline.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(deadline.priority)}`}>
                          {deadline.daysLeft} days left
                        </span>
                        <span className="text-xs text-gray-500">GH₵{deadline.amount}</span>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray-500">Due</p>
                      <p className="text-xs font-medium text-gray-900">
                        {deadline.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingDeadlines.length === 0 && (
                <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={handleViewAllPending}
            className="p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
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
