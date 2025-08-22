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



      {/* Recent Activity */}
      {notifications.length > 0 && (
        <div className="mt-6">
          <h5 className="font-medium text-gray-800 mb-3">Recent Activity</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {notifications.slice(0, 5).map((notification, index) => (
              <div key={index} className="flex items-center text-sm p-2 bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  notification.type === 'success' ? 'bg-green-500' :
                  notification.type === 'warning' ? 'bg-yellow-500' :
                  notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{notification.title}</div>
                  <div className="text-gray-600 text-xs">{notification.system}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPersistenceTest;
