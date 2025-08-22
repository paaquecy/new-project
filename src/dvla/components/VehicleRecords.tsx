import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { unifiedAPI, DVLAVehicle } from '../../lib/unified-api';
import {
  Search,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface VehicleRecord {
  id: number;
  licensePlate: string;
  make: string;
  model: string;
  owner: string;
  status: 'Active' | 'Expired' | 'Pending';
  regNumber: string;
  vehicleType: string;
  yearOfManufacture: number;
}

const VehicleRecords: React.FC = () => {
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleRecords, setVehicleRecords] = useState<VehicleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicleRecords();
  }, []);

  const fetchVehicleRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await unifiedAPI.getDVLAVehicles();

      if (response.data) {
        const vehiclesData = Array.isArray(response.data) ? response.data : [];
        console.log('Vehicle records data:', vehiclesData);

        // Convert DVLAVehicle to VehicleRecord format
        const records: VehicleRecord[] = vehiclesData.map((vehicle: DVLAVehicle) => ({
          id: vehicle.id,
          licensePlate: vehicle.license_plate,
          make: vehicle.manufacturer,
          model: vehicle.model,
          owner: vehicle.owner_name,
          status: vehicle.status === 'active' ? 'Active' as const :
                  vehicle.status === 'expired' ? 'Expired' as const : 'Pending' as const,
          regNumber: vehicle.reg_number,
          vehicleType: vehicle.vehicle_type,
          yearOfManufacture: vehicle.year_of_manufacture
        }));
        setVehicleRecords(records);
      } else {
        setError('Failed to load vehicle records');
      }
    } catch (err) {
      console.error('Error fetching vehicle records:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      setError('Failed to load vehicle records');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading vehicle records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 text-center transition-colors duration-200 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`text-red-600 mb-4 transition-colors duration-200 ${
          darkMode ? 'text-red-400' : 'text-red-600'
        }`}>
          {error}
        </div>
        <button
          onClick={fetchVehicleRecords}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleStatusChange = async (vehicleId: number, newStatus: 'active' | 'expired' | 'suspended') => {
    try {
      const response = await unifiedAPI.updateDVLAVehicle(vehicleId, { status: newStatus });
      if (response.data) {
        // Refresh the vehicle records
        await fetchVehicleRecords();
        alert(`Vehicle status updated to ${newStatus}`);
      } else {
        alert('Failed to update vehicle status');
      }
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      alert('Failed to update vehicle status');
    }
  };

  const filteredRecords = vehicleRecords.filter(record =>
    record.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddNewRecord = () => {
    alert('Add New Vehicle Record functionality would open a form here');
  };

  const handleEdit = (id: number) => {
    alert(`Edit Vehicle Record ${id} functionality would open a form here`);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this vehicle record?')) {
      handleStatusChange(id, 'suspended');
    }
  };

  return (
    <div className={`p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-2 transition-colors duration-200 ${
          darkMode ? 'text-gray-100' : 'text-gray-900'
        }`}>Vehicle Records</h1>
        <p className={`text-sm sm:text-base transition-colors duration-200 ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>Manage and view all registered vehicle records</p>
      </div>

      {/* Search and Add Button Section */}
      <div className={`rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={`h-5 w-5 transition-colors duration-200 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <input
              type="text"
              placeholder="Search by license plate, VIN, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Add New Record Button */}
          <button
            onClick={handleAddNewRecord}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm text-sm sm:text-base"
          >
            <Plus size={20} />
            <span>Add New Record</span>
          </button>
        </div>
      </div>

      {/* Vehicle Records Table */}
      <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y transition-colors duration-200 ${
            darkMode ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            <thead className={`transition-colors duration-200 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <tr>
                <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  License Plate
                </th>
                <th className={`hidden sm:table-cell px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Make
                </th>
                <th className={`hidden md:table-cell px-6 py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Model
                </th>
                <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Owner
                </th>
                <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y transition-colors duration-200 ${
              darkMode 
                ? 'bg-gray-800 divide-gray-700' 
                : 'bg-white divide-gray-200'
            }`}>
              {filteredRecords.map((record) => (
                <tr key={record.id} className={`transition-colors duration-150 ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium transition-colors duration-200 ${
                      darkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      {record.licensePlate}
                    </div>
                    {/* Mobile: Show make/model below license plate */}
                    <div className="sm:hidden">
                      <div className={`text-xs transition-colors duration-200 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {record.make} {record.model}
                      </div>
                    </div>
                  </td>
                  <td className={`hidden sm:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-200 ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="text-sm">{record.make}</div>
                  </td>
                  <td className={`hidden md:table-cell px-6 py-4 whitespace-nowrap transition-colors duration-200 ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="text-sm">{record.model}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className={`text-sm transition-colors duration-200 ${
                      darkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>{record.owner}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleEdit(record.id)}
                        className="inline-flex items-center justify-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 transition-all duration-200 text-xs sm:text-sm"
                      >
                        <Edit size={12} className="sm:hidden" />
                        <Edit size={14} className="hidden sm:inline" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="inline-flex items-center justify-center space-x-1 px-2 sm:px-3 py-1 sm:py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-all duration-200 text-xs sm:text-sm"
                      >
                        <Trash2 size={12} className="sm:hidden" />
                        <Trash2 size={14} className="hidden sm:inline" />
                        <span className="hidden sm:inline">Delete</span>
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
          <div className="text-center py-8 sm:py-12">
            <div className={`mb-2 transition-colors duration-200 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>No records found</div>
            <div className={`text-sm transition-colors duration-200 ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {searchTerm ? 'Try adjusting your search terms' : 'No vehicle records available'}
            </div>
          </div>
        )}
      </div>

      {/* Table Footer with Record Count */}
      <div className={`mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm transition-colors duration-200 ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <div>
          Showing {filteredRecords.length} of {vehicleRecords.length} records
        </div>
        <div className={`transition-colors duration-200 ${
          darkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {searchTerm && `Filtered by: "${searchTerm}"`}
        </div>
      </div>
    </div>
  );
};

export default VehicleRecords;
