import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Search, 
  ChevronDown, 
  RefreshCw, 
  Eye 
} from 'lucide-react';

interface RenewalRecord {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  owner: string;
  renewalDate: string;
  status: 'Due Soon' | 'Overdue' | 'Renewed';
}

const RegistrationRenewal: React.FC = () => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const renewalRecords: RenewalRecord[] = [
    {
      id: '1',
      licensePlate: 'ABC 123',
      make: 'Toyota',
      model: 'Camry',
      owner: 'Jane Doe',
      renewalDate: '2024-07-15',
      status: 'Due Soon'
    },
    {
      id: '2',
      licensePlate: 'XYZ 789',
      make: 'Honda',
      model: 'Civic',
      owner: 'Robert Smith',
      renewalDate: '2024-05-20',
      status: 'Overdue'
    },
    {
      id: '3',
      licensePlate: 'DEF 456',
      make: 'Ford',
      model: 'F-150',
      owner: 'Alice Johnson',
      renewalDate: '2023-11-01',
      status: 'Renewed'
    },
    {
      id: '4',
      licensePlate: 'GHI 012',
      make: 'BMW',
      model: 'X5',
      owner: 'Michael Brown',
      renewalDate: '2024-08-10',
      status: 'Due Soon'
    },
    {
      id: '5',
      licensePlate: 'JKL 345',
      make: 'Mercedes',
      model: 'C-Class',
      owner: 'Sarah Davis',
      renewalDate: '2024-06-05',
      status: 'Overdue'
    }
  ];

  const statusOptions = ['All Statuses', 'Due Soon', 'Overdue', 'Renewed'];

  const filteredRecords = renewalRecords.filter(record => {
    const matchesSearch = 
      record.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.renewalDate.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'All Statuses' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Due Soon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Renewed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleRenew = (id: string) => {
    console.log('Renew registration:', id);
  };

  const handleViewDetails = (id: string) => {
    console.log('View details:', id);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`p-8 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}></h1>
        <p className={`transition-colors duration-200 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}></p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by license plate, owner, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 bg-white min-w-[140px] justify-between"
            >
              <span className="text-gray-700">{statusFilter}</span>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleStatusFilter(option)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                      statusFilter === option ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
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

      {/* Registration Renewal Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Plate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Make
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renewal Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {record.licensePlate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.make}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.owner}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{record.renewalDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRenew(record.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
                      >
                        <RefreshCw size={14} />
                        <span>Renew</span>
                      </button>
                      <button
                        onClick={() => handleViewDetails(record.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition-all duration-200"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No renewal records found</div>
            <div className="text-sm text-gray-400">
              {searchTerm || statusFilter !== 'All Statuses' 
                ? 'Try adjusting your search terms or filters' 
                : 'No renewal records available'
              }
            </div>
          </div>
        )}
      </div>

      {/* Table Footer with Record Count */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {filteredRecords.length} of {renewalRecords.length} records
        </div>
        <div className="text-gray-500">
          {(searchTerm || statusFilter !== 'All Statuses') && (
            <span>
              Filtered by: {searchTerm && `"${searchTerm}"`}
              {searchTerm && statusFilter !== 'All Statuses' && ', '}
              {statusFilter !== 'All Statuses' && `Status: ${statusFilter}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationRenewal;