import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import ViolationDetailsModal from '../components/ViolationDetailsModal';
import { Violation } from '../types';
import { unifiedAPI } from '../lib/unified-api';

const PendingViolations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch violations on component mount
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const response = await unifiedAPI.getViolations(undefined, 'pending');
        if (response.data) {
          // Transform API violations to match component expectations
          const transformedViolations = response.data.map(v => ({
            id: v.id,
            plateNumber: v.plate_number,
            offense: v.violation_type,
            location: v.location || 'Location not specified',
            date: v.created_at ? new Date(v.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
            officer: `Officer ${v.officer_id || 'Unknown'}`,
            status: v.status,
            fine: v.fine_amount || 100,
            description: v.violation_details
          }));
          setViolations(transformedViolations);
        }
      } catch (error) {
        console.error('Failed to fetch violations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, []);

  const pendingViolations = violations.filter(v => v.status === 'pending');
  const officers = Array.from(new Set(violations.map(v => v.officer)));

  const filteredViolations = pendingViolations.filter(violation => {
    const matchesSearch = violation.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         violation.offense.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOfficer = !selectedOfficer || violation.officer === selectedOfficer;
    const matchesDate = !selectedDate || violation.date.startsWith(selectedDate);
    
    return matchesSearch && matchesOfficer && matchesDate;
  });

  const handleViewDetails = (violation: Violation) => {
    setSelectedViolation(violation);
    setModalOpen(true);
  };

  const handleAccept = async (violationId: string) => {
    try {
      const response = await unifiedAPI.approveViolation(violationId);
      if (response.error) {
        alert('Failed to accept violation: ' + response.error);
        return;
      }

      // Update local state
      setViolations(prev => prev.filter(v => v.id !== violationId));
      alert('Violation accepted successfully!');
    } catch (error) {
      alert('Failed to accept violation. Please try again.');
    }
  };

  const handleReject = async (violationId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      const response = await unifiedAPI.rejectViolation(violationId, reason || 'No reason provided');
      if (response.error) {
        alert('Failed to reject violation: ' + response.error);
        return;
      }

      // Update local state
      setViolations(prev => prev.filter(v => v.id !== violationId));
      alert('Violation rejected successfully!');
    } catch (error) {
      alert('Failed to reject violation. Please try again.');
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pending Violations</h1>
        <p className="text-gray-600 mt-2">Review and process traffic violations awaiting approval</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
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
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">All Officers</option>
                {officers.map(officer => (
                  <option key={officer} value={officer}>{officer}</option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredViolations.length}</span> of{' '}
          <span className="font-medium text-gray-900">{pendingViolations.length}</span> pending violations
        </p>
      </div>

      {/* Violations Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900">Plate Number</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900">Offense</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900 hidden md:table-cell">Officer</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900 hidden lg:table-cell">Date & Time</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900 hidden xl:table-cell">Location</th>
                <th className="px-3 sm:px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
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
                    <span className="text-gray-900">{violation.officer}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-900">{violation.date}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 hidden xl:table-cell">
                    <span className="text-gray-600">{violation.location}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(violation)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAccept(violation.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Accept Violation"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(violation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject Violation"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Loading violations...</h3>
          </div>
        )}

        {!loading && filteredViolations.length === 0 && (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No violations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>

      {/* Violation Details Modal */}
      <ViolationDetailsModal
        violation={selectedViolation}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedViolation(null);
        }}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
};

export default PendingViolations;
