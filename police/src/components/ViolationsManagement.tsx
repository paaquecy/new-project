import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  ChevronDown, 
  Calendar, 
  Eye,
  Filter
} from 'lucide-react';

interface Violation {
  id: string;
  plateNumber: string;
  violationType: string;
  location: string;
  timestamp: string;
  officer: string;
  status: string;
  description: string;
  fine: number;
}

const ViolationsManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [dateFilter, setDateFilter] = useState('');

  // Mock violations data
  const [violations] = useState<Violation[]>([
    {
      id: '1',
      plateNumber: 'GR 1234 - 23',
      violationType: 'Speeding',
      location: 'Ring Road Central, Accra',
      timestamp: '2024-01-15T10:30:00Z',
      officer: 'Officer Kwame',
      status: 'pending',
      description: 'Exceeding speed limit by 20 km/h',
      fine: 200
    },
    {
      id: '2',
      plateNumber: 'AS 5678 - 23',
      violationType: 'Parking',
      location: 'Kumasi High Street, Kumasi',
      timestamp: '2024-01-14T14:15:00Z',
      officer: 'Officer Ama',
      status: 'approved',
      description: 'Parking in no parking zone',
      fine: 100
    },
    {
      id: '3',
      plateNumber: 'WR 9876 - 23',
      violationType: 'Red Light',
      location: 'Takoradi High Street, Takoradi',
      timestamp: '2024-01-13T16:45:00Z',
      officer: 'Officer Kofi',
      status: 'pending',
      description: 'Running red light at intersection',
      fine: 75
    },
    {
      id: '4',
      plateNumber: 'ER 3456 - 23',
      violationType: 'Overloading',
      location: 'Koforidua Central, Koforidua',
      timestamp: '2024-01-12T11:20:00Z',
      officer: 'Officer Yaw',
      status: 'approved',
      description: 'Vehicle carrying more passengers than allowed',
      fine: 150
    },
    {
      id: '5',
      plateNumber: 'CR 7890 - 23',
      violationType: 'No Insurance',
      location: 'Cape Coast Road, Cape Coast',
      timestamp: '2024-01-11T09:30:00Z',
      officer: 'Officer Abena',
      status: 'pending',
      description: 'Vehicle operating without valid insurance',
      fine: 300
    },
    {
      id: '6',
      plateNumber: 'BA 4567 - 23',
      violationType: 'Illegal U-turn',
      location: 'Sunyani Main Street, Sunyani',
      timestamp: '2024-01-10T15:10:00Z',
      officer: 'Officer Kwesi',
      status: 'rejected',
      description: 'Making illegal U-turn on main road',
      fine: 50
    },
    {
      id: '7',
      plateNumber: 'NR 6789 - 23',
      violationType: 'No Seatbelt',
      location: 'Tamale Central, Tamale',
      timestamp: '2024-01-09T13:25:00Z',
      officer: 'Officer Fatima',
      status: 'pending',
      description: 'Driver not wearing seatbelt',
      fine: 25
    }
  ]);

  const statusOptions = ['All', 'Pending', 'Completed', 'Dismissed'];
  const typeOptions = ['All Types', 'Parking Violation', 'Speeding', 'Running Red Light', 'Illegal Parking', 'Expired License', 'No Insurance', 'Reckless Driving'];

  // Filter violations based on search and filters
  const filteredViolations = useMemo(() => {
    return violations.filter(violation => {
      const matchesSearch = 
        violation.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        violation.violationType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        violation.officer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        violation.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || violation.status === statusFilter;
      const matchesType = typeFilter === 'All Types' || violation.violationType === typeFilter;
      const matchesDate = !dateFilter || violation.timestamp.includes(dateFilter); // Assuming timestamp can be used for date filtering

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [violations, searchQuery, statusFilter, typeFilter, dateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const handleViewDetails = (violation: Violation) => {
    alert(`Viewing details for violation ID: ${parseInt(violation.id)}\nPlate: ${violation.plateNumber}\nType: ${violation.violationType}\nStatus: ${violation.status}\nOfficer: ${violation.officer}\nLocation: ${violation.location}`);
  };

  const getViolationStats = () => {
    const pending = violations.filter(v => v.status === 'pending').length;
    const approved = violations.filter(v => v.status === 'approved').length;
    const rejected = violations.filter(v => v.status === 'rejected').length;
    return { pending, approved, rejected, total: violations.length };
  };

  const stats = getViolationStats();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border-l-4 border-blue-500">
          <div className="text-xl lg:text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600 font-medium">Total Violations</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border-l-4 border-orange-500">
          <div className="text-xl lg:text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-600 font-medium">Pending</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border-l-4 border-green-500">
          <div className="text-xl lg:text-2xl font-bold text-green-600">{stats.approved}</div>
          <div className="text-sm text-gray-600 font-medium">Completed</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 border-l-4 border-gray-500">
          <div className="text-xl lg:text-2xl font-bold text-gray-600">{stats.rejected}</div>
          <div className="text-sm text-gray-600 font-medium">Dismissed</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 flex items-center">
            <Filter className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            Search & Filter Violations
          </h3>
          
          <div className="relative w-full lg:w-80 max-w-sm">
            <Search className="w-4 lg:w-5 h-4 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search violations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Status Filter */}
          <div className="relative">
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm lg:text-base"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 absolute right-3 top-8 lg:top-9 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm lg:text-base"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 absolute right-3 top-8 lg:top-9 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
            />
            <Calendar className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 absolute right-3 top-8 lg:top-9 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Violations Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-800 flex items-center">
            <AlertTriangle className="w-4 lg:w-5 h-4 lg:h-5 mr-2 text-blue-600" />
            All Violations ({filteredViolations.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plate Number
                </th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Violation Type
                </th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Date
                </th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Officer
                </th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 lg:px-6 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredViolations.length > 0 ? (
                filteredViolations.map((violation) => (
                  <tr key={violation.id} className="hover:bg-gray-50 transition-colors duration-200 text-sm">
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="text-xs lg:text-sm font-semibold text-gray-900 font-mono">
                        {violation.plateNumber}
                      </div>
                      <div className="text-xs text-gray-500 sm:hidden">
                        {violation.violationType}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-xs lg:text-sm text-gray-900">{violation.violationType}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-xs lg:text-sm text-gray-900">{violation.timestamp}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-xs lg:text-sm text-gray-900">{violation.officer}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(violation.status)}`}>
                        {violation.status}
                      </span>
                      <div className="text-xs text-gray-500 md:hidden mt-1">
                        {violation.timestamp}
                      </div>
                      <div className="text-xs text-gray-500 lg:hidden mt-1">
                        {violation.officer}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(violation)}
                        className="inline-flex items-center px-2 lg:px-4 py-1 lg:py-2 bg-blue-600 text-white text-xs lg:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Eye className="w-3 lg:w-4 h-3 lg:h-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <AlertTriangle className="w-8 lg:w-12 h-8 lg:h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No violations found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViolationsManagement;