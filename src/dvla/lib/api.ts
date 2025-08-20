import { unifiedAPI } from '../../lib/unified-api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  created_at?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface ProfileUpdateRequest {
  full_name: string;
  email: string;
  phone?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Authentication endpoints
  async login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await unifiedAPI.login(username, password, 'dvla');
      
      if (response.error) {
        return { success: false, message: response.error };
      }

      if (response.data) {
        this.setToken(response.data.access_token);
        return {
          success: true,
          data: {
            user: {
              id: 1,
              username: username,
              email: `${username}@dvla.gov.gh`,
              full_name: 'DVLA Officer',
              role: 'dvla',
              created_at: new Date().toISOString()
            },
            token: response.data.access_token
          }
        };
      }

      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      unifiedAPI.logout();
      this.clearToken();
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Logout failed' };
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await unifiedAPI.register(userData, 'dvla');
      
      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Registration failed' };
    }
  }

  // Profile management endpoints
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      // Mock profile data for now
      const user: User = {
        id: 1,
        username: 'dvla_officer',
        email: 'officer@dvla.gov.gh',
        full_name: 'DVLA Officer',
        role: 'dvla',
        created_at: new Date().toISOString()
      };
      
      return { success: true, data: { user } };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to get profile' };
    }
  }

  async updateProfile(profileData: ProfileUpdateRequest): Promise<ApiResponse<{ user: User }>> {
    try {
      // Mock profile update for now
      const user: User = {
        id: 1,
        username: 'dvla_officer',
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone,
        role: 'dvla',
        created_at: new Date().toISOString()
      };
      
      return { success: true, data: { user } };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to update profile' };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      // Mock password change for now
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to change password' };
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { User, ApiResponse, AuthResponse, ProfileUpdateRequest };
