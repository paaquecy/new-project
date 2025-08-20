import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Car, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  ClipboardCheck,
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, isOpen, onClose, onLogout }) => {
  const { darkMode } = useTheme();
  
  const menuItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'entry', label: 'Vehicle Data Entry', icon: Car },
    { id: 'records', label: 'Vehicle Records', icon: FileText },
    { id: 'renewal', label: 'Registration Renewal', icon: Calendar },
    { id: 'clearfines', label: 'Clear Fines', icon: ClipboardCheck },
    { id: 'analysis', label: 'Data Analysis & Reporting', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 h-screen flex flex-col transition-all duration-300 transform ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    } ${
      darkMode 
        ? 'bg-gray-800 text-gray-100' 
        : 'bg-slate-900 text-white'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b transition-colors duration-200 ${
        darkMode 
          ? 'border-gray-700' 
          : 'border-slate-700'
      }`}>
        <div className="flex items-center justify-between">
          <h1 className={`text-lg sm:text-xl font-bold transition-colors duration-200 ${
          darkMode 
            ? 'text-blue-300' 
            : 'text-blue-400'
        }`}>DVLA Dashboard</h1>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className={`lg:hidden p-1 rounded transition-colors duration-200 ${
              darkMode 
                ? 'hover:bg-gray-700 text-gray-300' 
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            ×
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-4 sm:py-6 overflow-y-auto">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? `${darkMode ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'} shadow-lg`
                      : `${darkMode 
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className={`p-4 border-t transition-colors duration-200 ${
        darkMode 
          ? 'border-gray-700' 
          : 'border-slate-700'
      }`}>
        <button
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            darkMode 
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          onClick={onLogout}
        >
          <LogOut size={20} />
          <span className="font-medium text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
