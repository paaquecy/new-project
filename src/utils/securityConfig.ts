// Centralized Security Configuration System
// This manages security settings that affect all applications

export interface SecurityConfig {
  passwordPolicy: 'weak' | 'medium' | 'strong' | 'very-strong';
  sessionTimeout: number; // in minutes
  twoFactorEnabled: boolean;
  ipWhitelistEnabled: boolean;
  lastUpdated: string;
  updatedBy: string;
}

// Default security configuration
const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  passwordPolicy: 'strong',
  sessionTimeout: 30,
  twoFactorEnabled: true,
  ipWhitelistEnabled: false,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'System'
};

// Storage key for security configuration
const SECURITY_CONFIG_KEY = 'unified_security_config';

// Get current security configuration
export const getSecurityConfig = (): SecurityConfig => {
  try {
    const stored = localStorage.getItem(SECURITY_CONFIG_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      // Ensure all required fields are present
      return {
        ...DEFAULT_SECURITY_CONFIG,
        ...config
      };
    }
    return DEFAULT_SECURITY_CONFIG;
  } catch (error) {
    console.error('Error reading security config:', error);
    return DEFAULT_SECURITY_CONFIG;
  }
};

// Save security configuration
export const saveSecurityConfig = (config: Partial<SecurityConfig>, updatedBy: string = 'Admin'): boolean => {
  try {
    const currentConfig = getSecurityConfig();
    const newConfig: SecurityConfig = {
      ...currentConfig,
      ...config,
      lastUpdated: new Date().toISOString(),
      updatedBy
    };
    
    localStorage.setItem(SECURITY_CONFIG_KEY, JSON.stringify(newConfig));
    
    // Notify all apps about the security config change
    notifySecurityConfigChange(newConfig);
    
    return true;
  } catch (error) {
    console.error('Error saving security config:', error);
    return false;
  }
};

// Password validation based on current policy
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const config = getSecurityConfig();
  const errors: string[] = [];
  
  switch (config.passwordPolicy) {
    case 'weak':
      if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      break;
      
    case 'medium':
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        errors.push('Password must contain both uppercase and lowercase letters');
      }
      break;
      
    case 'strong':
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        errors.push('Password must contain both uppercase and lowercase letters');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
      break;
      
    case 'very-strong':
      if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
      }
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        errors.push('Password must contain both uppercase and lowercase letters');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Session timeout management
export const getSessionTimeout = (): number => {
  const config = getSecurityConfig();
  return config.sessionTimeout;
};

// Check if session should expire
export const shouldExpireSession = (lastActivity: string): boolean => {
  const config = getSecurityConfig();
  const lastActivityTime = new Date(lastActivity).getTime();
  const currentTime = new Date().getTime();
  const timeoutMs = config.sessionTimeout * 60 * 1000; // Convert minutes to milliseconds
  
  return (currentTime - lastActivityTime) > timeoutMs;
};

// Two-factor authentication check
export const isTwoFactorEnabled = (): boolean => {
  const config = getSecurityConfig();
  return config.twoFactorEnabled;
};

// IP whitelist check
export const isIpWhitelistEnabled = (): boolean => {
  const config = getSecurityConfig();
  return config.ipWhitelistEnabled;
};

// Security configuration change notification system
type SecurityConfigChangeListener = (config: SecurityConfig) => void;

const securityConfigListeners: SecurityConfigChangeListener[] = [];

// Subscribe to security configuration changes
export const subscribeToSecurityConfigChanges = (listener: SecurityConfigChangeListener): () => void => {
  securityConfigListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = securityConfigListeners.indexOf(listener);
    if (index > -1) {
      securityConfigListeners.splice(index, 1);
    }
  };
};

// Notify all listeners about security config changes
const notifySecurityConfigChange = (config: SecurityConfig) => {
  securityConfigListeners.forEach(listener => {
    try {
      listener(config);
    } catch (error) {
      console.error('Error in security config listener:', error);
    }
  });
};

// Reset security configuration to defaults
export const resetSecurityConfig = (): boolean => {
  try {
    localStorage.removeItem(SECURITY_CONFIG_KEY);
    notifySecurityConfigChange(DEFAULT_SECURITY_CONFIG);
    return true;
  } catch (error) {
    console.error('Error resetting security config:', error);
    return false;
  }
};

// Get security configuration history
export const getSecurityConfigHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('security_config_history') || '[]');
  } catch (error) {
    console.error('Error reading security config history:', error);
    return [];
  }
};

// Add entry to security configuration history
export const addSecurityConfigHistoryEntry = (action: string, details: string, user: string) => {
  try {
    const history = getSecurityConfigHistory();
    const entry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      details,
      user,
      config: getSecurityConfig()
    };
    
    history.push(entry);
    
    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    localStorage.setItem('security_config_history', JSON.stringify(history));
  } catch (error) {
    console.error('Error adding security config history entry:', error);
  }
};
