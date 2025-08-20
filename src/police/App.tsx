import React, { useState, useEffect } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import {
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './components/OverviewDashboard';
import ViolationFlagging from './components/ViolationFlagging';
import ViolationsManagement from './components/ViolationsManagement';
import VehicleInformationAccess from './components/VehicleInformationAccess';
import FieldReporting from './components/FieldReporting';
import PersonalSettings from './components/PersonalSettings';
import VerifyLicense from './components/VerifyLicense';
import SessionStatusIndicator from '../components/SessionStatusIndicator';

// Lazy load VehicleScanner to avoid OpenCV loading issues
const VehicleScanner = React.lazy(() => import('./components/VehicleScanner'));

interface PoliceAppProps {
  onLogout?: () => void;
}

function App({ onLogout }: PoliceAppProps) {
  return (
    <AuthProvider>
      <DataProvider>
        <PoliceAppContent onLogout={onLogout} />
      </DataProvider>
    </AuthProvider>
  );
}

function PoliceAppContent({ onLogout }: PoliceAppProps) {
  const [activeNav, setActiveNav] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeNav) {
      case 'overview':
        return 'Good Morning, Officer!';
      case 'scanner':
        return 'Vehicle Plate Scanner';
      case 'flagging':
        return 'Violation Flagging System';
      case 'violations':
        return 'Violations Management';
      case 'vehicle-info':
        return 'Vehicle Information Access';
      case 'field-reporting':
        return 'Field Reporting';
      case 'settings':
        return 'Personal Settings';
      case 'verify-license':
        return 'Verify License';
      default:
        return 'Police Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewDashboard onNavigate={setActiveNav} />;
      case 'scanner':
        return (
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Loading Vehicle Scanner...</span>
            </div>
          }>
            <VehicleScanner />
          </React.Suspense>
        );
      case 'flagging':
        return <ViolationFlagging />;
      case 'violations':
        return <ViolationsManagement />;
      case 'vehicle-info':
        return <VehicleInformationAccess />;
      case 'field-reporting':
        return <FieldReporting />;
      case 'settings':
        return <PersonalSettings />;
      case 'verify-license':
        return <VerifyLicense />;
      default:
        return <OverviewDashboard />;
    }
  };

  // Add error boundary
  const [hasError, setHasError] = useState(false);
  
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Application error:', error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-['Inter',sans-serif] relative">
      {/* Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={() => {
          onLogout?.();
        }}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-lg lg:text-2xl font-bold text-gray-800 truncate">{getPageTitle()}</h2>
            </div>
            <div className="relative flex-shrink-0 w-full max-w-xs lg:max-w-sm">
              <X className="w-4 lg:w-5 h-4 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 lg:pl-10 pr-3 lg:pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>

      {/* Session Status Indicator */}
      <SessionStatusIndicator isLoggedIn={true} />
    </div>
  );
}

export default App;
