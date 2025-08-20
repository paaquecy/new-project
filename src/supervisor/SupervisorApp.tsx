import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PendingViolations from './pages/PendingViolations';
import History from './pages/History';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { logAuth, logSystem } from '../utils/auditLog';
import { updateActivity } from '../utils/sessionManager';
import { DataProvider } from '../contexts/DataContext';

interface SupervisorAppProps {
  onLogout?: () => void;
}

function SupervisorApp({ onLogout }: SupervisorAppProps) {
  return (
    <DataProvider>
      <SupervisorAppContent onLogout={onLogout} />
    </DataProvider>
  );
}

function SupervisorAppContent({ onLogout }: SupervisorAppProps) {
  // Initialize audit logging for supervisor app
  useEffect(() => {
    logSystem('Supervisor App Loaded', 'Supervisor accessed supervisor dashboard', 'supervisor');
    updateActivity();
  }, []);

  const handleLogout = () => {
    logAuth('User Logout', 'Supervisor logged out of supervisor system', 'supervisor', true);
    onLogout?.();
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/supervisor" element={<Layout onLogout={handleLogout} />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pending" element={<PendingViolations />} />
            <Route path="history" element={<History />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/" element={<Navigate to="/supervisor/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/supervisor/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default SupervisorApp;
