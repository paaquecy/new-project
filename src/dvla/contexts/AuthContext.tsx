import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, User, ProfileUpdateRequest } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: ProfileUpdateRequest) => Promise<{ success: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token and load user profile on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          await refreshProfile();
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Clear invalid token
          apiClient.clearToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.login(username, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData: ProfileUpdateRequest): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.updateProfile(profileData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true, message: response.message || 'Profile updated successfully' };
      } else {
        return { success: false, message: response.message || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Profile update failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      const response = await apiClient.changePassword(currentPassword, newPassword);
      
      return { 
        success: response.success, 
        message: response.message || (response.success ? 'Password changed successfully' : 'Password change failed')
      };
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Password change failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
