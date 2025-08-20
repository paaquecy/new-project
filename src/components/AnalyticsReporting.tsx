import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Car, 
  AlertTriangle,
  FileText,
  Download,
  Calendar,
  Activity,
  PieChart,
  LineChart,
  TrendingDown,
  Minus
} from 'lucide-react';
import { fetchAnalyticsData, generateReport, exportData, AnalyticsData } from '../utils/analyticsService';

const AnalyticsReporting: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data on component mount
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAnalyticsData();
        setAnalyticsData(data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Error loading analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !analyticsData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
                             <p className="text-sm text-red-700 mt-1">
                 {error || 'Failed to load analytics data. Please try again later.'}
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use analytics data for reports
  const { recentReports } = analyticsData;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log('Search query:', e.target.value);
  };

  const handleGenerateViolationReport = async () => {
    try {
      const report = await generateReport('Violation Summary');
      console.log('Generated report:', report);
      alert(`Report generated successfully: ${report.title}`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleExportVehicleRegistry = async () => {
    try {
      const downloadUrl = await exportData('vehicle-registry', 'csv');
      console.log('Export URL:', downloadUrl);
      alert('Vehicle registry exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleUserActivityLog = async () => {
    try {
      const downloadUrl = await exportData('user-activity', 'pdf');
      console.log('Export URL:', downloadUrl);
      alert('User activity log exported successfully!');
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleViewReport = (reportTitle: string) => {
    console.log(`View Report clicked: ${reportTitle}`);
  };

  const handleDownloadReport = (reportTitle: string) => {
    console.log(`Download Report clicked: ${reportTitle}`);
  };

  // Helper function to get icon components
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Car': Car,
      'AlertTriangle': AlertTriangle,
      'Users': Users,
      'BarChart3': BarChart3,
      'Activity': Activity,
      'PieChart': PieChart
    };
    return iconMap[iconName] || BarChart3;
  };

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsData.kpiData.map((kpi, index) => {
          const IconComponent = getIconComponent(kpi.icon);
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{kpi.label}</p>
                  {kpi.trend && (
                    <div className="flex items-center mt-2">
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : kpi.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      ) : (
                        <Minus className="w-4 h-4 text-gray-600 mr-1" />
                      )}
                      <span className={`text-xs font-medium ${
                        kpi.trend === 'up' ? 'text-green-600' : 
                        kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {kpi.changePercent}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full ${kpi.bgColor} ${kpi.color}`}>
                  <IconComponent size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Violation Trends (Last 7 Days)</h2>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-7 gap-2 h-full">
              {analyticsData.violationTrends.map((trend, index) => (
                <div key={index} className="flex flex-col justify-end space-y-1">
                  <div className="text-xs text-gray-500 text-center mb-2">
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="bg-red-500 rounded-t-sm" style={{ height: `${(trend.violations / 25) * 100}%` }}></div>
                    <div className="bg-green-500 rounded-t-sm" style={{ height: `${(trend.resolved / 20) * 100}%` }}></div>
                    <div className="bg-yellow-500 rounded-t-sm" style={{ height: `${(trend.pending / 15) * 100}%` }}></div>
                  </div>
                  <div className="text-xs text-center mt-1">
                    <div className="text-red-600 font-medium">{trend.violations}</div>
                    <div className="text-green-600 text-xs">{trend.resolved}</div>
                    <div className="text-yellow-600 text-xs">{trend.pending}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
                <span>Violations</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                <span>Resolved</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
                <span>Pending</span>
          </div>
            </div>
          </div>
        </div>

        {/* Vehicle Scan Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Vehicle Scan Activity by Type</h2>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            <div className="flex items-end justify-between h-full space-x-2">
              {analyticsData.vehicleScanActivity.map((vehicle, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-500 text-center mb-2">
                    {vehicle.vehicleType}
                  </div>
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(vehicle.count / 500) * 100}%` }}
                  ></div>
                  <div className="text-xs text-center mt-2">
                    <div className="font-medium text-gray-900">{vehicle.count}</div>
                    <div className="text-blue-600">{vehicle.percentage}%</div>
                  </div>
          </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">System Performance</h2>
          </div>
          <div className="h-48 bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="flex flex-col justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analyticsData.systemPerformance.responseTime}ms</div>
                  <div className="text-xs text-gray-600">Response Time</div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analyticsData.systemPerformance.uptime}%</div>
                  <div className="text-xs text-gray-600">Uptime</div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analyticsData.systemPerformance.activeUsers}</div>
                  <div className="text-xs text-gray-600">Active Users</div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
            <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analyticsData.systemPerformance.systemLoad}%</div>
                  <div className="text-xs text-gray-600">System Load</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Activity Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">User Activity Distribution</h2>
          </div>
          <div className="h-48 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-center h-full">
              <div className="relative w-32 h-32">
                {/* Simple pie chart representation */}
                <div className="absolute inset-0 rounded-full border-8 border-transparent" 
                     style={{
                       background: `conic-gradient(
                         ${analyticsData.userActivityDistribution[0]?.color || '#3B82F6'} 0deg ${(analyticsData.userActivityDistribution[0]?.percentage || 0) * 3.6}deg,
                         ${analyticsData.userActivityDistribution[1]?.color || '#10B981'} ${(analyticsData.userActivityDistribution[0]?.percentage || 0) * 3.6}deg ${((analyticsData.userActivityDistribution[0]?.percentage || 0) + (analyticsData.userActivityDistribution[1]?.percentage || 0)) * 3.6}deg,
                         ${analyticsData.userActivityDistribution[2]?.color || '#F59E0B'} ${((analyticsData.userActivityDistribution[0]?.percentage || 0) + (analyticsData.userActivityDistribution[1]?.percentage || 0)) * 3.6}deg ${((analyticsData.userActivityDistribution[0]?.percentage || 0) + (analyticsData.userActivityDistribution[1]?.percentage || 0) + (analyticsData.userActivityDistribution[2]?.percentage || 0)) * 3.6}deg,
                         ${analyticsData.userActivityDistribution[3]?.color || '#EF4444'} ${((analyticsData.userActivityDistribution[0]?.percentage || 0) + (analyticsData.userActivityDistribution[1]?.percentage || 0) + (analyticsData.userActivityDistribution[2]?.percentage || 0)) * 3.6}deg 360deg
                       )`
                     }}>
                </div>
                <div className="absolute inset-0 rounded-full bg-white w-16 h-16 top-8 left-8"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              {analyticsData.userActivityDistribution.map((user, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: user.color }}></div>
                  <span className="truncate">{user.role}</span>
                  <span className="ml-auto font-medium">{user.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today's Scans</span>
              <span className="text-lg font-semibold text-gray-900">{analyticsData.quickStats.todayScans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Violations</span>
              <span className="text-lg font-semibold text-red-600">{analyticsData.quickStats.newViolations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resolved Today</span>
              <span className="text-lg font-semibold text-green-600">{analyticsData.quickStats.resolvedToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-lg font-semibold text-blue-600">{analyticsData.quickStats.activeSessions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reports & Exports and Recent Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports & Exports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <FileText className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Reports & Exports</h2>
          </div>
          <div className="space-y-4">
            <button
              onClick={handleGenerateViolationReport}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FileText size={16} className="mr-2" />
              Generate Violation Report
            </button>
            <button
              onClick={handleExportVehicleRegistry}
              className="w-full px-4 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors font-medium flex items-center justify-center"
            >
              <Download size={16} className="mr-2" />
              Export Vehicle Registry
            </button>
            <button
              onClick={handleUserActivityLog}
              className="w-full px-4 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors font-medium flex items-center justify-center"
            >
              <Activity size={16} className="mr-2" />
              User Activity Log
            </button>
          </div>
          
          {/* Additional Export Options */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Exports</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                CSV Export
              </button>
              <button className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                PDF Report
              </button>
              <button className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                Excel Export
              </button>
              <button className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                JSON Data
              </button>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          </div>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-md border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {report.title}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {report.type}
                    </span>
                    <span className="text-xs text-gray-500">{report.date}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' :
                      report.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleViewReport(report.title)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Report"
                  >
                    <FileText size={16} />
                  </button>
                  {report.status === 'completed' && (
                  <button
                    onClick={() => handleDownloadReport(report.title)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Download Report"
                  >
                    <Download size={16} />
                  </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
              View All Reports →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReporting;