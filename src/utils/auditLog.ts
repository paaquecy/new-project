// Centralized Audit Log System for tracking activities across all applications

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  app: 'main' | 'police' | 'dvla' | 'supervisor';
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data' | 'admin' | 'violation' | 'approval' | 'system';
}

// Storage key
const AUDIT_LOG_STORAGE_KEY = 'prs_audit_log';

// Get all audit log entries
export const getAuditLogs = (): AuditLogEntry[] => {
  try {
    const logs = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error getting audit logs from storage:', error);
    return [];
  }
};

// Save audit logs to localStorage
export const saveAuditLogs = (logs: AuditLogEntry[]): void => {
  try {
    // Keep only the latest 1000 entries to prevent storage overflow
    const latestLogs = logs.slice(-1000);
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(latestLogs));
  } catch (error) {
    console.error('Error saving audit logs to storage:', error);
  }
};

// Add new audit log entry
export const logAuditEntry = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void => {
  try {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    const existingLogs = getAuditLogs();
    existingLogs.push(newEntry);
    saveAuditLogs(existingLogs);

    console.log('Audit log entry added:', newEntry);
  } catch (error) {
    console.error('Error adding audit log entry:', error);
  }
};

// Get current user info (helper function)
export const getCurrentUser = (): { user: string; userId: string } => {
  // This would typically come from authentication context
  // For now, we'll determine based on current app state
  const currentUser = localStorage.getItem('current_user');
  if (currentUser) {
    const user = JSON.parse(currentUser);
    return {
      user: `${user.firstName} ${user.lastName}`,
      userId: user.id
    };
  }
  
  // Fallback for admin/supervisor
  return {
    user: 'Admin User',
    userId: 'admin-001'
  };
};

// Specific logging functions for different actions

// Authentication related logs
export const logAuth = (action: string, details: string, app: AuditLogEntry['app'], success: boolean = true) => {
  const { user, userId } = getCurrentUser();
  logAuditEntry({
    user,
    userId,
    app,
    action,
    details,
    severity: success ? 'low' : 'high',
    category: 'auth'
  });
};

// Data operations logs
export const logDataOperation = (action: string, details: string, app: AuditLogEntry['app'], severity: AuditLogEntry['severity'] = 'medium') => {
  const { user, userId } = getCurrentUser();
  logAuditEntry({
    user,
    userId,
    app,
    action,
    details,
    severity,
    category: 'data'
  });
};

// Violation related logs
export const logViolation = (action: string, details: string, app: AuditLogEntry['app'], severity: AuditLogEntry['severity'] = 'medium') => {
  const { user, userId } = getCurrentUser();
  logAuditEntry({
    user,
    userId,
    app,
    action,
    details,
    severity,
    category: 'violation'
  });
};

// Approval related logs
export const logApproval = (action: string, details: string, app: AuditLogEntry['app'], severity: AuditLogEntry['severity'] = 'medium') => {
  const { user, userId } = getCurrentUser();
  logAuditEntry({
    user,
    userId,
    app,
    action,
    details,
    severity,
    category: 'approval'
  });
};

// Administrative actions logs
export const logAdmin = (action: string, details: string, app: AuditLogEntry['app'], severity: AuditLogEntry['severity'] = 'high') => {
  const { user, userId } = getCurrentUser();
  logAuditEntry({
    user,
    userId,
    app,
    action,
    details,
    severity,
    category: 'admin'
  });
};

// System operations logs
export const logSystem = (action: string, details: string, app: AuditLogEntry['app'], severity: AuditLogEntry['severity'] = 'low') => {
  const { user, userId } = getCurrentUser();
  logAuditEntry({
    user,
    userId,
    app,
    action,
    details,
    severity,
    category: 'system'
  });
};

// Filter audit logs by criteria
export const filterAuditLogs = (
  logs: AuditLogEntry[],
  filters: {
    user?: string;
    action?: string;
    app?: string;
    category?: string;
    severity?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): AuditLogEntry[] => {
  return logs.filter(log => {
    if (filters.user && !log.user.toLowerCase().includes(filters.user.toLowerCase())) {
      return false;
    }
    if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) {
      return false;
    }
    if (filters.app && log.app !== filters.app) {
      return false;
    }
    if (filters.category && log.category !== filters.category) {
      return false;
    }
    if (filters.severity && log.severity !== filters.severity) {
      return false;
    }
    if (filters.dateFrom && new Date(log.timestamp) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(log.timestamp) > new Date(filters.dateTo)) {
      return false;
    }
    return true;
  });
};

// Initialize with some demo audit logs
export const initializeDemoAuditLogs = (): void => {
  const existingLogs = getAuditLogs();
  
  if (existingLogs.length === 0) {
    const demoLogs: AuditLogEntry[] = [
      {
        id: 'demo-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        user: 'Admin User',
        userId: 'admin-001',
        app: 'main',
        action: 'User Login',
        details: 'Administrator logged into main system',
        severity: 'low',
        category: 'auth'
      },
      {
        id: 'demo-2',
        timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
        user: 'Kwame Asante',
        userId: 'demo-police-1',
        app: 'police',
        action: 'Plate Scan',
        details: 'Scanned license plate GH-1234-20',
        severity: 'medium',
        category: 'violation'
      },
      {
        id: 'demo-3',
        timestamp: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
        user: 'Ama Osei',
        userId: 'demo-dvla-1',
        app: 'dvla',
        action: 'Vehicle Registration',
        details: 'Registered new vehicle with plate AS-5678-21',
        severity: 'medium',
        category: 'data'
      },
      {
        id: 'demo-4',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        user: 'Martin Mensah',
        userId: 'supervisor-001',
        app: 'supervisor',
        action: 'Violation Approved',
        details: 'Approved speeding violation for plate GH-1234-20',
        severity: 'high',
        category: 'approval'
      },
      {
        id: 'demo-5',
        timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
        user: 'Admin User',
        userId: 'admin-001',
        app: 'main',
        action: 'User Account Approved',
        details: 'Approved police officer account for John Doe',
        severity: 'high',
        category: 'approval'
      }
    ];
    
    saveAuditLogs(demoLogs);
    console.log('Demo audit logs initialized');
  }
};
