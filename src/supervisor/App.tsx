import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PendingViolations from './pages/PendingViolations';
import History from './pages/History';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex font-['Inter',sans-serif] relative">
        <Routes>
          <Route path="/supervisor" element={<Layout />}>
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

export default App;