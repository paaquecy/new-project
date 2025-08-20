import React, { useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import VehicleDataEntry from './components/VehicleDataEntry';
import OverviewDashboard from './components/OverviewDashboard';
import VehicleRecords from './components/VehicleRecords';
import RegistrationRenewal from './components/RegistrationRenewal';
import DataAnalysis from './components/DataAnalysis';
import ClearFines from './components/ClearFines';
import Settings from './components/Settings';

function App() {
  const [activeMenuItem, setActiveMenuItem] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode } = useTheme();

  const handleMenuItemClick = (item: string) => {
    setActiveMenuItem(item);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case 'entry':
        return <VehicleDataEntry />;
      case 'records':
        return <VehicleRecords />;
      case 'renewal':
        return <RegistrationRenewal />;
      case 'clearfines':
        return <ClearFines />;
      case 'analysis':
        return <DataAnalysis />;
      case 'settings':
        return <Settings />;
      case 'overview':
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-200 font-['Inter',sans-serif] ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <Sidebar 
        activeItem={activeMenuItem} 
        onItemClick={handleMenuItemClick}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-200 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} activeMenuItem={activeMenuItem} />
        
        {/* Dashboard Content */}
        <div className={`flex-1 overflow-auto transition-colors duration-200 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          {renderContent()}
        </div>
        
        {/* Status Bar */}
        {activeMenuItem === 'overview' && <StatusBar />}
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;