import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import FilterBar from './components/FilterBar';
import PendingApprovalsTable from './components/PendingApprovalsTable';
import ViolationFilterBar from './components/ViolationFilterBar';
import ViolationTable from './components/ViolationTable';
import Dashboard from './components/Dashboard';
import UserAccountManagement from './components/UserAccountManagement';
import VehicleRegistry from './components/VehicleRegistry';
import AnalyticsReporting from './components/AnalyticsReporting';
import SecurityManagement from './components/SecurityManagement';
import AdministrativeControls from './components/AdministrativeControls';
import SystemSettings from './components/SystemSettings';
import AddNewRole from './components/AddNewRole';
import NotificationsPage from './components/NotificationsPage';
import NotificationsContent from './components/NotificationsContent';
import AuditLogViewer from './components/AuditLogViewer';
import SessionStatusIndicator from './components/SessionStatusIndicator';
import DataPersistenceTest from './components/DataPersistenceTest';
import { ThemeProvider as DvlaThemeProvider } from './dvla/contexts/ThemeContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import DvlaApp from './dvla/App';
import PoliceApp from './police/App';
import SupervisorApp from './supervisor/SupervisorApp';
import './dvla/index.css';
import './police/index.css';
import type { PendingApproval } from './components/PendingApprovalsTable';
import { initializeDemoUsers, getPendingUsers } from './utils/userStorage';
import { initializeDemoAuditLogs, logAuth, logAdmin, logSystem } from './utils/auditLog';
import {
  initializeSession,
  saveSessionState,
  loginWithSession,
  logoutWithSession,
  updateActivity,
  setupSessionValidation
} from './utils/sessionManager';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

function AppContent() {
  // Initialize state from session or defaults
  const initialSession = initializeSession();

  const [isLoggedIn, setIsLoggedIn] = useState(initialSession.isLoggedIn);
  const [showRegister, setShowRegister] = useState(false);
  const [activeItem, setActiveItem] = useState(initialSession.activeItem);
  const [currentPage, setCurrentPage] = useState(initialSession.currentPage);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');

  // Pending approvals state
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

  // Initialize demo users, session validation, and load pending approvals on component mount
  useEffect(() => {
    initializeDemoUsers();
    initializeDemoAuditLogs();
    loadPendingApprovals();

    // Only log system startup if not restoring from session
    if (!initialSession.isLoggedIn) {
      logSystem('System Startup', 'Main application initialized', 'main');
    } else {
      logSystem('Session Restored', 'User session restored from browser storage', 'main');
    }

    // Set up session validation
    const cleanup = setupSessionValidation(() => {
      // Handle session expiration
      setIsLoggedIn(false);
      setActiveItem('violation-management');
      setCurrentPage('dashboard');
      logAuth('Session Expired', 'User session expired due to inactivity', 'main', false);
    });

    // Cleanup on unmount
    return cleanup;
  }, []);

  // Set up global activity tracking for logged in users
  useEffect(() => {
    if (!isLoggedIn) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      // Debounce activity updates to avoid excessive calls
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        updateActivity();
      }, 1000); // Update activity after 1 second of inactivity
    };

    // Add event listeners for activity tracking
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup on unmount or when logged out
    return () => {
      clearTimeout(activityTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isLoggedIn]);

  const loadPendingApprovals = () => {
    const pendingUsers = getPendingUsers();
    const formattedApprovals: PendingApproval[] = pendingUsers.map(user => ({
      id: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.accountType === 'police' ? 'Police Officer' : 'DVLA Officer',
      requestDate: new Date(user.createdAt).toLocaleDateString(),
      accountType: user.accountType,
      additionalInfo: {
        badgeNumber: user.badgeNumber || '',
        rank: user.rank || '',
        station: user.station || '',
        idNumber: user.idNumber || '',
        position: user.position || ''
      }
    }));
    setPendingApprovals(formattedApprovals);
  };
  
  // Violation management specific filters
  const [plateNumberFilter, setPlateNumberFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [violationStatusFilter, setViolationStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    console.log('Dark mode toggled to:', enabled);
  };

  const handleItemClick = (item: string) => {
    setActiveItem(item);

    // Save navigation state to session
    saveSessionState({ activeItem: item });
    updateActivity();

    console.log(`Navigation clicked: ${item}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log(`Search query: ${query}`);
  };

  const handleFilterChange = (filter: string) => {
    setFilterQuery(filter);
  };

  const handlePlateNumberChange = (plateNumber: string) => {
    setPlateNumberFilter(plateNumber);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
  };

  const handleViolationStatusChange = (status: string) => {
    setViolationStatusFilter(status);
  };

  const handleDateChange = (date: string) => {
    setDateFilter(date);
  };

  const handleLogin = (app: 'main' | 'dvla' | 'police' | 'supervisor' | null) => {
    if (app) {
      setIsLoggedIn(true);

      // Update session with login info
      loginWithSession(app);

      if (app === 'main') {
        setActiveItem('overview');
        logAuth('User Login', 'Administrator logged into main system', 'main', true);
      } else {
        setActiveItem(app);
        logAuth('User Login', `User logged into ${app} application`, app as any, true);
      }

      // Update activity
      updateActivity();
    } else {
      logAuth('Login Failed', 'Invalid credentials provided', 'main', false);
      alert('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    logAuth('User Logout', 'User logged out of system', 'main', true);

    // Clear session
    logoutWithSession();

    setIsLoggedIn(false);
    setActiveItem('violation-management');
    setCurrentPage('dashboard');
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    alert('Registration successful! You can now login.');
  };

  const handleNewRegistration = (approval: any) => {
    // Refresh pending approvals from storage instead of just adding to state
    loadPendingApprovals();
    logAdmin('New Registration', `New ${approval.accountType} officer registration: ${approval.firstName} ${approval.lastName}`, 'main');
  };

  const handlePageNavigation = (page: string) => {
    setCurrentPage(page);
    if (page === 'dashboard') {
      setActiveItem('overview');
    } else if (page === 'notifications') {
      setActiveItem('notifications');
    }

    // Save page navigation state to session
    saveSessionState({
      currentPage: page,
      activeItem: page === 'dashboard' ? 'overview' : page === 'notifications' ? 'notifications' : activeItem
    });
    updateActivity();
    
    console.log(`Page navigation: ${page}, Active item set to: ${page === 'dashboard' ? 'overview' : page === 'notifications' ? 'notifications' : activeItem}`);
  };

  const getPageTitle = () => {
    switch (activeItem) {
      case 'overview':
        return 'Overview Dashboard';
      case 'pending-approvals':
        return 'Pending Approvals';
      case 'violation-management':
        return 'Violation Management';
      case 'notifications':
        return 'Notifications';
      case 'user-accounts':
        return 'User Account Management';
      case 'vehicle-registry':
        return 'Vehicle Registry';
      case 'analytics':
        return 'Analytics & Reporting';
      case 'security':
        return 'Security Management';
      case 'system-settings':
        return 'System Settings';
      case 'admin-controls':
        return 'Administrative Controls';
      case 'add-new-role':
        return 'Add New Role';
      case 'audit-log':
        return 'Audit Log Viewer';
      default:
        return 'Plate Recognition System';
    }
  };

  // Render the correct app after login
  if (activeItem === 'dvla') {
    return (
      <DvlaThemeProvider>
        <DvlaApp onLogout={handleLogout} />
      </DvlaThemeProvider>
    );
  }
  if (activeItem === 'police') {
    return (
      <PoliceApp onLogout={handleLogout} />
    );
  }
  if (activeItem === 'supervisor') {
    return (
      <SupervisorApp onLogout={handleLogout} />
    );
  }

  // Note: We're removing the separate NotificationsPage rendering
  // and instead using the main app layout with sidebar navigation

  const renderMainContent = () => {
    switch (activeItem) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Dashboard darkMode={darkMode} />
            <div className="p-6">
              <DataPersistenceTest />
            </div>
          </div>
        );
      case 'pending-approvals':
        return (
          <>
            <FilterBar 
              onFilterChange={handleFilterChange}
            />
            
            <PendingApprovalsTable
              searchQuery={searchQuery}
              filterQuery={filterQuery}
              approvals={pendingApprovals}
              setApprovals={setPendingApprovals}
              onRefresh={loadPendingApprovals}
            />
          </>
        );
      case 'violation-management':
        return (
          <>
            <ViolationFilterBar
              onPlateNumberChange={handlePlateNumberChange}
              onTypeChange={handleTypeChange}
              onStatusChange={handleViolationStatusChange}
              onDateChange={handleDateChange}
            />

            <ViolationTable
              searchQuery={searchQuery}
              plateNumberFilter={plateNumberFilter}
              typeFilter={typeFilter}
              statusFilter={violationStatusFilter}
              dateFilter={dateFilter}
            />
          </>
        );
      case 'notifications':
        return <NotificationsContent />;
      case 'user-accounts':
        return <UserAccountManagement searchQuery={searchQuery} />;
      case 'vehicle-registry':
        return <VehicleRegistry searchQuery={searchQuery} />;
      case 'analytics':
        return <AnalyticsReporting />;
      case 'security':
        return <SecurityManagement />;
      case 'system-settings':
        return <SystemSettings onDarkModeToggle={handleDarkModeToggle} darkMode={darkMode} />;
      case 'admin-controls':
        return <AdministrativeControls onNavigate={setActiveItem} />;
      case 'add-new-role':
        return <AddNewRole onNavigate={setActiveItem} />;
      case 'audit-log':
        return <AuditLogViewer onNavigate={setActiveItem} />;
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Select a menu item to view content
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    if (showRegister) {
      return (
        <RegisterPage
          onBackToLogin={handleBackToLogin}
          onRegisterSuccess={handleRegisterSuccess}
          onNewRegistration={handleNewRegistration}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={handleShowRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-['Inter',sans-serif] relative">
      <Sidebar 
        activeItem={activeItem} 
        onItemClick={handleItemClick} 
        onLogout={handleLogout} 
        darkMode={darkMode}
      />
      
      <div className="flex-1 lg:ml-0">
        <TopBar title={getPageTitle()} onSearch={handleSearch} darkMode={darkMode} onNavigate={handlePageNavigation} />
        
        <main className={`min-h-[calc(100vh-4rem)] ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {renderMainContent()}
        </main>
      </div>

      {/* Session Status Indicator */}
      <SessionStatusIndicator isLoggedIn={isLoggedIn} />
    </div>
  );
}

export default App;
