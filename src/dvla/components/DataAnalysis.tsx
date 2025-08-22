import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { unifiedAPI, DVLAAnalytics } from '../../lib/unified-api';
import {
  Calendar,
  ChevronDown,
  Car,
  RefreshCw,
  AlertTriangle,
  Clock,
  TrendingUp,
  PieChart,
  BarChart3
} from 'lucide-react';

const DataAnalysis: React.FC = () => {
  const { darkMode } = useTheme();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All Vehicle Types');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [analytics, setAnalytics] = useState<DVLAAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await unifiedAPI.getDVLAAnalytics();
      console.log('Analytics API response:', response);
      if (response.data) {
        setAnalytics(response.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const vehicleTypeOptions = [
    'All Vehicle Types',
    'Sedan',
    'SUV', 
    'Truck',
    'Hatchback',
    'Coupe',
    'Motorcycle'
  ];

  const handleApplyFilters = async () => {
    console.log('Applying filters:', { dateFrom, dateTo, vehicleTypeFilter });
    // In a real implementation, you would pass these filters to the API
    await fetchAnalyticsData();
  };

  const handleVehicleTypeFilter = (type: string) => {
    setVehicleTypeFilter(type);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`p-8 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Data Analysis & Reporting</h1>
        <p className={`transition-colors duration-200 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Comprehensive analytics and insights for DVLA operations</p>
      </div>

      {/* Filter Bar */}
      <div className={`rounded-xl shadow-sm border p-6 mb-8 transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col gap-6">
          {/* Date Range Selector */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <label className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Date Range:
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={`w-full sm:w-auto px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
                </div>
                <span className={`text-center sm:text-left font-medium transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>to</span>
                <div className="relative">
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={`w-full sm:w-auto px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            {/* Vehicle Type Dropdown */}
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-medium transition-colors duration-200 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Vehicle Type:
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center space-x-2 px-4 py-3 border rounded-lg hover:bg-gray-50 transition-all duration-200 justify-between ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{vehicleTypeFilter}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                {isDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-full border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-200'
                  }`}>
                    {vehicleTypeOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleVehicleTypeFilter(option)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                          vehicleTypeFilter === option 
                            ? 'bg-blue-50 text-blue-600' 
                            : `${darkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-50'}`
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={handleApplyFilters}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm whitespace-nowrap"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className={`ml-3 transition-colors duration-200 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>Loading analytics data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`p-8 text-center transition-colors duration-200 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <div className={`text-red-600 mb-4 transition-colors duration-200 ${
            darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {error}
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards - Top Row */}
      {!isLoading && !error && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Vehicles Registered */}
          <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Vehicles Registered</p>
                <p className="text-3xl font-bold text-blue-600 mb-1">{analytics.total_vehicles.toLocaleString()}</p>
                <p className="text-sm text-green-600 font-medium">Renewal Rate: {analytics.renewal_rate}%</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-500">
                <Car size={24} />
              </div>
            </div>
          </div>

          {/* Renewals This Month */}
          <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Renewals</p>
                <p className="text-3xl font-bold text-green-600 mb-1">{analytics.total_renewals.toLocaleString()}</p>
                <p className={`text-sm font-medium transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Pending: {analytics.pending_renewals}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-500">
                <RefreshCw size={24} />
              </div>
            </div>
          </div>

          {/* Fines Overview */}
          <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Total Fines</p>
                <p className="text-3xl font-bold text-red-600 mb-1">{analytics.total_fines.toLocaleString()}</p>
                <p className="text-sm text-red-600 font-medium">Unpaid: {analytics.unpaid_fines}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 text-red-500">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue and Performance - Middle Row */}
      {!isLoading && !error && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Revenue This Month</p>
                <p className={`text-4xl font-bold mb-1 transition-colors duration-200 ${
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>${analytics.revenue_this_month.toLocaleString()}</p>
                <p className={`text-sm font-medium transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>From renewals and fines</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 text-purple-500">
                <TrendingUp size={32} />
              </div>
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
            darkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Fine Payment Rate</p>
                <p className={`text-4xl font-bold mb-1 transition-colors duration-200 ${
                  darkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>{analytics.fine_payment_rate}%</p>
                <p className={`text-sm font-medium transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>Collection efficiency</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 text-green-500">
                <Clock size={32} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Areas - Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Registrations Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Registrations Trend</h3>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200">
            <div className="text-center">
              <BarChart3 className="mx-auto mb-3 text-blue-400" size={48} />
              <p className="text-blue-600 font-medium">Line Chart Visualization</p>
              <p className="text-sm text-blue-500 mt-1">Monthly registration trends over time</p>
            </div>
          </div>
          
          {/* Chart Legend/Info */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>New Registrations</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Renewals</span>
              </div>
            </div>
            <span className="text-gray-500">Last 12 months</span>
          </div>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="text-purple-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Type Distribution</h3>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200">
            <div className="text-center">
              <PieChart className="mx-auto mb-3 text-purple-400" size={48} />
              <p className="text-purple-600 font-medium">Pie Chart Visualization</p>
              <p className="text-sm text-purple-500 mt-1">Distribution by vehicle type</p>
            </div>
          </div>
          
          {/* Chart Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Sedan (35%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">SUV (28%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Truck (20%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Other (17%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics Summary */}
      {!isLoading && !error && analytics && (
        <div className={`mt-8 rounded-xl shadow-sm border p-6 transition-colors duration-200 ${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>Quick Analytics Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg transition-colors duration-200 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-2xl font-bold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>{analytics.renewal_rate}%</p>
              <p className={`text-sm transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Renewal Rate</p>
            </div>
            <div className={`text-center p-4 rounded-lg transition-colors duration-200 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-2xl font-bold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>{analytics.fine_payment_rate}%</p>
              <p className={`text-sm transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Fine Payment Rate</p>
            </div>
            <div className={`text-center p-4 rounded-lg transition-colors duration-200 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-2xl font-bold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>${analytics.revenue_this_month.toLocaleString()}</p>
              <p className={`text-sm transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Monthly Revenue</p>
            </div>
            <div className={`text-center p-4 rounded-lg transition-colors duration-200 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <p className={`text-2xl font-bold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>{analytics.total_vehicles + analytics.total_renewals + analytics.total_fines}</p>
              <p className={`text-sm transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Records</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalysis;
