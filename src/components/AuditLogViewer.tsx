import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  User, 
  Filter, 
  Download, 
  Eye,
  AlertTriangle,
  Info,
  Shield,
  Search
} from 'lucide-react';
import { getAuditLogs, filterAuditLogs, AuditLogEntry } from '../utils/auditLog';

interface AuditLogViewerProps {
  onNavigate?: (page: string) => void;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ onNavigate }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    app: '',
    category: '',
    severity: '',
    user: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // Load audit logs on component mount
  useEffect(() => {
    const logs = getAuditLogs();
    // Sort by timestamp (newest first)
    const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setAuditLogs(sortedLogs);
  }, []);

  // Filter logs based on search and filters
  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    filtered = filterAuditLogs(filtered, filters);

    return filtered;
  }, [auditLogs, searchQuery, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      app: '',
      category: '',
      severity: '',
      user: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchQuery('');
  };

  const exportLogs = () => {
    const csvContent = [
      // CSV header
      ['Timestamp', 'User', 'App', 'Action', 'Details', 'Category', 'Severity'].join(','),
      // CSV data
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.user,
        log.app,
        log.action,
        `"${log.details.replace(/"/g, '""')}"`, // Escape quotes
        log.category,
        log.severity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Shield className="w-4 h-4" />;
      case 'violation': return <AlertTriangle className="w-4 h-4" />;
      case 'approval': return <Eye className="w-4 h-4" />;
      case 'admin': return <User className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getAppColor = (app: string) => {
    switch (app) {
      case 'police': return 'text-blue-600 bg-blue-100';
      case 'dvla': return 'text-green-600 bg-green-100';
      case 'supervisor': return 'text-purple-600 bg-purple-100';
      case 'main': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Log Viewer</h1>
            <p className="text-gray-600">Monitor and track all system activities across applications</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportLogs}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('admin-controls')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Admin
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* App Filter */}
            <select
              value={filters.app}
              onChange={(e) => handleFilterChange('app', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Apps</option>
              <option value="main">Main</option>
              <option value="police">Police</option>
              <option value="dvla">DVLA</option>
              <option value="supervisor">Supervisor</option>
            </select>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="auth">Authentication</option>
              <option value="data">Data Operations</option>
              <option value="violation">Violations</option>
              <option value="approval">Approvals</option>
              <option value="admin">Administration</option>
              <option value="system">System</option>
            </select>

            {/* Severity Filter */}
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Date Filters */}
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From Date"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To Date"
              />
            </div>
            
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredLogs.length} of {auditLogs.length} audit log entries
        </p>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  App
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAppColor(log.app)}`}>
                      {log.app.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getCategoryIcon(log.category)}
                      <span className="ml-2 text-sm text-gray-600 capitalize">{log.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedEntry(log)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No audit log entries found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-gray-900">{selectedEntry.user}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Application</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAppColor(selectedEntry.app)}`}>
                    {selectedEntry.app.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <p className="text-sm text-gray-900">{selectedEntry.action}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Details</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedEntry.details}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <div className="flex items-center mt-1">
                      {getCategoryIcon(selectedEntry.category)}
                      <span className="ml-2 text-sm text-gray-900 capitalize">{selectedEntry.category}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${getSeverityColor(selectedEntry.severity)}`}>
                      {selectedEntry.severity.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Entry ID</label>
                  <p className="text-sm text-gray-500 font-mono">{selectedEntry.id}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
