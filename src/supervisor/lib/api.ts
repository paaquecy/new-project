import { unifiedAPI } from '../../lib/unified-api';

export interface Violation {
  id: string;
  plate_number: string;
  violation_type: string;
  violation_details?: string;
  location?: string;
  status: string;
  fine_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalToday: number;
  accepted: number;
  rejected: number;
  pending: number;
  weeklyData: Array<{
    day: string;
    accepted: number;
    rejected: number;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

class SupervisorAPI {
  // Get dashboard statistics
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await unifiedAPI.getViolationStats();
      
      if (response.error) {
        return { success: false, message: response.error };
      }

      // Mock dashboard stats for now
      const stats: DashboardStats = {
        totalToday: 25,
        accepted: 15,
        rejected: 5,
        pending: 5,
        weeklyData: [
          { day: 'Mon', accepted: 12, rejected: 3 },
          { day: 'Tue', accepted: 15, rejected: 2 },
          { day: 'Wed', accepted: 18, rejected: 4 },
          { day: 'Thu', accepted: 14, rejected: 1 },
          { day: 'Fri', accepted: 16, rejected: 3 },
          { day: 'Sat', accepted: 8, rejected: 2 },
          { day: 'Sun', accepted: 5, rejected: 1 }
        ]
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to get dashboard stats' };
    }
  }

  // Get pending violations
  async getPendingViolations(): Promise<ApiResponse<Violation[]>> {
    try {
      const response = await unifiedAPI.getViolations(undefined, 'pending');
      
      if (response.error) {
        return { success: false, message: response.error };
      }

      const violations = Array.isArray(response.data) ? response.data : [];
      
      return { success: true, data: violations };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to get pending violations' };
    }
  }

  // Get all violations (for history)
  async getAllViolations(): Promise<ApiResponse<Violation[]>> {
    try {
      const response = await unifiedAPI.getViolations();
      
      if (response.error) {
        return { success: false, message: response.error };
      }

      const violations = Array.isArray(response.data) ? response.data : [];
      
      return { success: true, data: violations };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to get violations' };
    }
  }

  // Approve violation
  async approveViolation(violationId: string): Promise<ApiResponse<any>> {
    try {
      const response = await unifiedAPI.approveViolation(violationId);
      
      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to approve violation' };
    }
  }

  // Reject violation
  async rejectViolation(violationId: string, reason: string): Promise<ApiResponse<any>> {
    try {
      const response = await unifiedAPI.rejectViolation(violationId, reason);
      
      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Failed to reject violation' };
    }
  }

  // Authentication
  async login(username: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await unifiedAPI.login(username, password, 'supervisor');
      
      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  logout() {
    unifiedAPI.logout();
  }
}

export const supervisorAPI = new SupervisorAPI();
export default supervisorAPI;
