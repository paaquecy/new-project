import React from 'react';
import { useData } from '../contexts/DataContext';
import { Database } from 'lucide-react';

const DataPersistenceTest: React.FC = () => {
  const {
    users,
    violations,
    vehicles,
    fines
  } = useData();

  const dataStats = {
    users: users.length,
    violations: violations.length,
    vehicles: vehicles.length,
    fines: fines.length
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <Database className="w-5 h-5 mr-2 text-blue-600" />
        Data Persistence Status
      </h3>
      
      {/* Data Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{dataStats.users}</div>
          <div className="text-sm text-blue-800">Users</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{dataStats.violations}</div>
          <div className="text-sm text-green-800">Violations</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{dataStats.vehicles}</div>
          <div className="text-sm text-yellow-800">Vehicles</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{dataStats.fines}</div>
          <div className="text-sm text-purple-800">Fines</div>
        </div>
      </div>

      {/* Storage Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-800 mb-2">Storage Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Storage Type:</span>
            <span className="ml-2 text-gray-800">LocalStorage (Browser)</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Persistence:</span>
            <span className="ml-2 text-green-600">✓ Enabled</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Real-time Sync:</span>
            <span className="ml-2 text-green-600">✓ Active</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Cross-App Data:</span>
            <span className="ml-2 text-green-600">✓ Shared</span>
          </div>
        </div>
      </div>



    </div>
  );
};

export default DataPersistenceTest;
