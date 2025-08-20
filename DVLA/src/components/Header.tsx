import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  activeMenuItem: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, activeMenuItem }) => {
  const { darkMode } = useTheme();
  
  const getPageInfo = (menuItem: string) => {
    switch (menuItem) {
      case 'entry':
        return {
          title: 'Vehicle Data Entry',
          description: 'Enter comprehensive vehicle information for registration'
        };
      case 'records':
        return {
          title: 'Vehicle Records',
          description: 'Manage and view all registered vehicle records'
        };
      case 'renewal':
        return {
          title: 'Registration Renewal',
          description: 'Manage vehicle registration renewals and track expiration dates'
        };
      case 'clearfines':
        return {
          title: 'Clear Fines',
          description: 'Manage and process vehicle fines'
        };
      case 'analysis':
        return {
          title: 'Data Analysis & Reporting',
          description: 'Comprehensive insights and analytics for vehicle registration data'
        };
      case 'settings':
        return {
          title: 'Settings',
          description: 'Manage your account settings and preferences'
        };
      case 'overview':
      default:
        return {
          title: 'Overview Dashboard',
          description: 'Welcome back to your DVLA dashboard'
        };
    }
  };

  const pageInfo = getPageInfo(activeMenuItem);
  
  return (
    <div className={`border-b px-8 py-6 transition-colors duration-200 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className={`lg:hidden mr-4 p-2 rounded-lg transition-colors duration-200 ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Menu size={24} />
          </button>
          
          <div>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold transition-colors duration-200 ${
            darkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>{pageInfo.title}</h1>
            <p className={`mt-1 text-sm sm:text-base transition-colors duration-200 ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{pageInfo.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`hidden sm:flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={20} />
            </div>
            <div>
              <p className={`font-semibold transition-colors duration-200 ${
                darkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>John Doe</p>
              <p className={`text-sm transition-colors duration-200 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Administrator</p>
            </div>
          </div>
          
          {/* Mobile User Avatar */}
          <div className="sm:hidden w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;