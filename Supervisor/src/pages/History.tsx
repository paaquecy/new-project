import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Download, CheckCircle, XCircle, Filter } from 'lucide-react';
import { unifiedAPI } from '../lib/unified-api';

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch violations
  const fetchViolations = async () => {
    setLoading(true);
    try {
      // Fetch both approved and rejected violations
      const [approvedResponse, rejectedResponse] = await Promise.all([
        unifiedAPI.getViolations(undefined, 'approved'),
        unifiedAPI.getViolations(undefined, 'rejected')
      ]);

      const allViolations = [];

      if (approvedResponse.data) {
        allViolations.push(...approvedResponse.data.map(v => ({
          id: v.id,
          plateNumber: v.plate_number,
          offense: v.violation_type,
          description: v.violation_details,
          capturedBy: `Officer ${v.officer_id || 'Unknown'}`,
          dateTime: v.created_at || new Date().toISOString(),
          status: v.status,
          location: v.location || 'Location not specified',
          reviewedBy: 'Supervisor',
          reviewedAt: v.updated_at || v.created_at
        })));
      }

      if (rejectedResponse.data) {
        allViolations.push(...rejectedResponse.data.map(v => ({
          id: v.id,
          plateNumber: v.plate_number,
          offense: v.violation_type,
          description: v.violation_details,
          capturedBy: `Officer ${v.officer_id || 'Unknown'}`,
          dateTime: v.created_at || new Date().toISOString(),
          status: v.status,
          location: v.location || 'Location not specified',
          reviewedBy: 'Supervisor',
          reviewedAt: v.updated_at || v.created_at,
          rejectionReason: 'Rejected by supervisor'
        })));
      }

      // Sort by review date (most recent first)
      allViolations.sort((a, b) => new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime());
      setViolations(allViolations);
    } catch (error) {
      console.error('Failed to fetch violations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviewed violations on component mount
  useEffect(() => {
    fetchViolations();
  }, []);

  // Set up polling to refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchViolations, 30000);
    return () => clearInterval(interval);
  }, []);

  const reviewedViolations = violations;
  const officers = Array.from(new Set(violations.map(v => v.capturedBy)));

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
    console.log('Export triggered:', format);
    console.log('Filtered violations count:', filteredViolations.length);
    console.log('Filtered violations data:', filteredViolations);

    if (filteredViolations.length === 0) {
      alert('No data to export. Please adjust your filters.');
      return;
    }

    try {
      if (format === 'csv') {
        exportToCSV();
      } else if (format === 'pdf') {
        exportToPDF();
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  const exportToCSV = () => {
    try {
      console.log('Starting CSV export...');

      // Define CSV headers
      const headers = [
        'Plate Number',
        'Offense',
        'Description',
        'Officer',
        'Date Captured',
        'Status',
        'Reviewed By',
        'Review Date',
        'Location'
      ];

      // Convert data to CSV format
      const csvData = filteredViolations.map(violation => [
        violation.plateNumber || '',
        violation.offense || '',
        violation.description || '',
        violation.capturedBy || '',
        violation.dateTime ? formatDateTime(violation.dateTime) : '',
        violation.status === 'approved' || violation.status === 'accepted' ? 'Approved' : 'Rejected',
        violation.reviewedBy || '',
        violation.reviewedAt ? formatDateTime(violation.reviewedAt) : '',
        violation.location || ''
      ]);

      // Combine headers and data
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');

      console.log('CSV content generated:', csvContent.substring(0, 200) + '...');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const filename = `violation-history-${new Date().toISOString().split('T')[0]}.csv`;

      console.log('Creating download link...');

      // Use a more compatible download method
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      // Show success message
      console.log('CSV export completed successfully');
      alert(`Successfully exported ${filteredViolations.length} records to CSV file: ${filename}`);

    } catch (error) {
      console.error('CSV export error:', error);
      alert(`Failed to export CSV: ${error.message}`);
    }
  };

  const exportToPDF = () => {
    try {
      console.log('Starting PDF export...');

      // Alternative PDF export method using window.print
      const printContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1>Traffic Violation History Report</h1>
            <h3>Supervisor Dashboard</h3>
          </div>

          <div style="text-align: right; margin-bottom: 20px; font-size: 12px; color: #666;">
            Generated on: ${new Date().toLocaleString()}
          </div>

          <p><strong>Total Records:</strong> ${filteredViolations.length}</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">Plate Number</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">Offense</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">Officer</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">Date Captured</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">Status</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">Reviewed By</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">Review Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredViolations.map(violation => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;"><strong>${violation.plateNumber || ''}</strong></td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${violation.offense || ''}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${violation.capturedBy || ''}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${violation.dateTime ? formatDateTime(violation.dateTime) : ''}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px; color: ${violation.status === 'approved' || violation.status === 'accepted' ? '#16a34a' : '#dc2626'}; font-weight: bold;">
                    ${violation.status === 'approved' || violation.status === 'accepted' ? 'Approved' : 'Rejected'}
                  </td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${violation.reviewedBy || '-'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${violation.reviewedAt ? formatDateTime(violation.reviewedAt) : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
            <p>This report was generated automatically by the Traffic Management System</p>
          </div>
        </div>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');

      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Violation History Report</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { size: A4; margin: 1cm; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);

        printWindow.document.close();

        // Wait for content to load then trigger print
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
            console.log('PDF export completed successfully');
            alert(`Successfully generated PDF report with ${filteredViolations.length} records! Use your browser's print dialog to save as PDF.`);
          }, 500);
        });

      } else {
        // Fallback: show alert about popup blocker
        alert('PDF export requires popup windows. Please allow popups for this site and try again.');
      }

    } catch (error) {
      console.error('PDF export error:', error);
      alert(`Failed to export PDF: ${error.message}`);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved' || status === 'accepted') {
      return (
        <div className="flex items-center space-x-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-sm">
          <CheckCircle className="h-3 w-3" />
          <span>Approved</span>
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
              <option value="approved">Approved</option>
              <option value="accepted">Approved</option>
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

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Loading violation history...</h3>
          </div>
        )}

        {!loading && filteredViolations.length === 0 && (
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
