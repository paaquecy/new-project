import React from 'react';
import { useData } from '../contexts/DataContext';
import { Save, Download, RotateCcw, Database } from 'lucide-react';

const DataPersistenceTest: React.FC = () => {
  const { 
    users, 
    violations, 
    vehicles, 
    fines, 
    notifications,
    exportAllData,
    clearAllData,
    refreshData,
    addNotification 
  } = useData();

  const handleTestDataPersistence = () => {
    // Test creating a notification
    addNotification({
      title: 'Data Persistence Test',
      message: `Test performed at ${new Date().toLocaleString()}`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      system: 'Main App'
    });
    
    alert('Test notification added! Check if it persists after refresh.');
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const dataStats = {
    users: users.length,
    violations: violations.length,
    vehicles: vehicles.length,
    fines: fines.length,
    notifications: notifications.length
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
        <Database className="w-5 h-5 mr-2 text-blue-600" />
        Data Persistence Status
      </h3>
      
      {/* Data Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{dataStats.notifications}</div>
          <div className="text-sm text-gray-800">Notifications</div>
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

      {/* Test Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleTestDataPersistence}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Test Persistence
          </button>
          
          <button
            onClick={handleRefreshPage}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh Page
          </button>
          
          <button
            onClick={exportAllData}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          
          <button
            onClick={() => {
              if (confirm('Are you sure? This will clear all data!')) {
                clearAllData();
                addNotification({
                  title: 'Data Cleared',
                  message: 'All system data has been reset to defaults',
                  type: 'warning',
                  timestamp: new Date().toISOString(),
                  read: false,
                  system: 'Main App'
                });
              }
            }}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            <Database className="w-4 h-4 mr-2" />
            Reset Data
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">Testing Instructions:</h5>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Click "Test Persistence" to add test data</li>
          <li>2. Click "Refresh Page" to reload the application</li>
          <li>3. Check if the test notification appears in notifications</li>
          <li>4. Switch between apps (Police, DVLA, Supervisor) to verify shared data</li>
          <li>5. Make changes in one app and verify they appear in others</li>
          <li>6. Use "Export Data" to download all system data as JSON</li>
        </ol>
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
