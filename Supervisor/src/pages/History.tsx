import React, { useState } from 'react';
import { Search, Calendar, User, Download, CheckCircle, XCircle, Filter } from 'lucide-react';
import { mockViolations } from '../data/mockData';

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reviewedViolations = mockViolations.filter(v => v.status !== 'pending');
  const officers = Array.from(new Set(mockViolations.map(v => v.capturedBy)));

  const filteredViolations = reviewedViolations.filter(violation => {
    const matchesSearch = violation.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         violation.offense.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOfficer = !selectedOfficer || violation.capturedBy === selectedOfficer;
    const matchesStatus = !selectedStatus || violation.status === selectedStatus;
    
    let matchesDateRange = true;
    if (startDate || endDate) {
      const violationDate = new Date(violation.dateTime).toISOString().split('T')[0];
      if (startDate && violationDate < startDate) matchesDateRange = false;
      if (endDate && violationDate > endDate) matchesDateRange = false;
    }
    
    return matchesSearch && matchesOfficer && matchesStatus && matchesDateRange;
  });

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting ${filteredViolations.length} records as ${format.toUpperCase()}`);
    alert(`Exporting ${filteredViolations.length} records as ${format.toUpperCase()}. Feature coming soon!`);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'accepted') {
      return (
        <div className="flex items-center space-x-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-sm">
          <CheckCircle className="h-3 w-3" />
          <span>Accepted</span>
        </div>
      );
    } else if (status === 'rejected') {
      return (
        <div className="flex items-center space-x-1 text-red-700 bg-red-100 px-2 py-1 rounded-full text-sm">
          <XCircle className="h-3 w-3" />
          <span>Rejected</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Violation History</h1>
        <p className="text-gray-600 mt-2">View all reviewed traffic violations and export reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Search */}
          <div className="xl:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by plate number or offense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Officer Filter */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">All Officers</option>
              {officers.map(officer => (
                <option key={officer} value={officer}>{officer}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Start Date"
              />
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Results and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredViolations.length}</span> of{' '}
          <span className="font-medium text-gray-900">{reviewedViolations.length}</span> reviewed violations
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900">Plate Number</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900">Offense</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900 hidden md:table-cell">Officer</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900 hidden lg:table-cell">Date Captured</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900 hidden xl:table-cell">Reviewed By</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900 hidden xl:table-cell">Review Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredViolations.map((violation) => (
                <tr key={violation.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4">
                    <span className="font-mono font-semibold text-gray-900">{violation.plateNumber}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{violation.offense}</p>
                      <p className="text-sm text-gray-600 truncate max-w-32 sm:max-w-48">{violation.description}</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                    <span className="text-gray-900">{violation.capturedBy}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-900">{formatDateTime(violation.dateTime)}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    {getStatusBadge(violation.status)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden xl:table-cell">
                    <span className="text-gray-900">{violation.reviewedBy || '-'}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden xl:table-cell">
                    <span className="text-gray-900">
                      {violation.reviewedAt ? formatDateTime(violation.reviewedAt) : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredViolations.length === 0 && (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No history found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;