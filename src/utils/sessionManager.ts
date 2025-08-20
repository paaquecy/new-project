// Session Management Utility for maintaining app state across browser refreshes

export interface SessionState {
  isLoggedIn: boolean;
  activeItem: string;
  currentPage: string;
  currentApp: 'main' | 'dvla' | 'police' | 'supervisor' | null;
  userInfo?: {
    username: string;
    accountType: 'admin' | 'police' | 'dvla' | 'supervisor';
  };
  lastActivity: string;
}

const SESSION_STORAGE_KEY = 'prs_session_state';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// Save current session state
export const saveSessionState = (state: Partial<SessionState>): void => {
  try {
    const currentState = getSessionState();
    const newState: SessionState = {
      ...currentState,
      ...state,
      lastActivity: new Date().toISOString()
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newState));
  } catch (error) {
    console.error('Error saving session state:', error);
  }
};

// Get current session state
export const getSessionState = (): SessionState => {
  try {
    const storedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedState) {
      const parsed: SessionState = JSON.parse(storedState);
      
      // Check if session has expired
      if (isSessionExpired(parsed.lastActivity)) {
        clearSession();
        return getDefaultSessionState();
      }
      
      return parsed;
    }
  } catch (error) {
    console.error('Error getting session state:', error);
  }
  
  return getDefaultSessionState();
};

// Check if session has expired
export const isSessionExpired = (lastActivity: string): boolean => {
  try {
    const lastActivityTime = new Date(lastActivity).getTime();
    const currentTime = new Date().getTime();
    return (currentTime - lastActivityTime) > SESSION_TIMEOUT;
  } catch (error) {
    return true; // If we can't parse the time, consider it expired
  }
};

// Clear session data
export const clearSession = (): void => {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

// Get default session state
export const getDefaultSessionState = (): SessionState => {
  return {
    isLoggedIn: false,
    activeItem: 'violation-management',
    currentPage: 'dashboard',
    currentApp: null,
    lastActivity: new Date().toISOString()
  };
};

// Initialize session on app start
export const initializeSession = (): SessionState => {
  const sessionState = getSessionState();
  
  // Update last activity to current time if session is valid
  if (sessionState.isLoggedIn) {
    saveSessionState({ lastActivity: new Date().toISOString() });
  }
  
  return sessionState;
};

// Update user activity (call this on user interactions)
export const updateActivity = (): void => {
  const currentState = getSessionState();
  if (currentState.isLoggedIn) {
    saveSessionState({ lastActivity: new Date().toISOString() });
  }
};

// Login with session persistence
export const loginWithSession = (
  app: 'main' | 'dvla' | 'police' | 'supervisor',
  username?: string,
  accountType?: 'admin' | 'police' | 'dvla' | 'supervisor'
): void => {
  let activeItem = 'violation-management';
  
  // Set appropriate default active item based on app
  switch (app) {
    case 'main':
      activeItem = 'overview';
      break;
    case 'police':
    case 'dvla':
    case 'supervisor':
      activeItem = app;
      break;
  }

  saveSessionState({
    isLoggedIn: true,
    currentApp: app,
    activeItem,
    userInfo: username && accountType ? { username, accountType } : undefined
  });
};

// Logout and clear session
export const logoutWithSession = (): void => {
  clearSession();
};

// Get navigation state for specific app
export const getAppNavigationState = (app: 'police' | 'dvla' | 'supervisor'): any => {
  try {
    const appStateKey = `prs_${app}_nav_state`;
    const storedState = sessionStorage.getItem(appStateKey);
    return storedState ? JSON.parse(storedState) : null;
  } catch (error) {
    console.error(`Error getting ${app} navigation state:`, error);
    return null;
  }
};

// Save navigation state for specific app
export const saveAppNavigationState = (app: 'police' | 'dvla' | 'supervisor', state: any): void => {
  try {
    const appStateKey = `prs_${app}_nav_state`;
    sessionStorage.setItem(appStateKey, JSON.stringify(state));
  } catch (error) {
    console.error(`Error saving ${app} navigation state:`, error);
  }
};

// Set up periodic session validation (call this in app initialization)
export const setupSessionValidation = (onSessionExpired: () => void): (() => void) => {
  const interval = setInterval(() => {
    const sessionState = getSessionState();
    if (sessionState.isLoggedIn && isSessionExpired(sessionState.lastActivity)) {
      clearSession();
      onSessionExpired();
    }
  }, 60000); // Check every minute

  // Return cleanup function
  return () => clearInterval(interval);
};
