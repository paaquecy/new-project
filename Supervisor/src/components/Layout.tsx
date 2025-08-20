import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Clock, 
  History, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/supervisor/dashboard' },
    { id: 'pending', label: 'Pending Violations', icon: Clock, path: '/supervisor/pending' },
    { id: 'history', label: 'History', icon: History, path: '/supervisor/history' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/supervisor/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/supervisor/settings' }
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 fixed left-0 top-0 h-full z-50 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
      } w-64`}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Traffic Control</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block p-4 border-b">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-800">Traffic Control</h1>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="p-4">
          {(!sidebarCollapsed || mobileMenuOpen) && (
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Martin Mensah</p>
                  <p className="text-sm text-gray-500">Supervisor</p>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.path)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={sidebarCollapsed && !mobileMenuOpen ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {(!sidebarCollapsed || mobileMenuOpen) && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => console.log('Logout clicked')}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
              sidebarCollapsed && !mobileMenuOpen ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed && !mobileMenuOpen ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(!sidebarCollapsed || mobileMenuOpen) && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-800">Traffic Control</h1>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;