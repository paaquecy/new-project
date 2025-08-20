import { unifiedAPI } from './unified-api';

export interface Violation {
  id: string;
  plate_number: string;
  vehicle_id?: string;
  officer_id?: string;
  violation_type: string;
  violation_details?: string;
  location?: string;
  status?: string;
  evidence_urls?: string[];
  fine_amount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: number;
  plate_number?: string;
  reg_number?: string;
  vin: string;
  make?: string;
  manufacturer?: string;
  model: string;
  year?: number;
  year_of_manufacture?: number;
  color: string;
  owner_name: string;
  owner_address?: string;
  registration_status?: string;
  registration_expiry?: string;
  insurance_status?: string;
  insurance_expiry?: string;
  status?: string;
}

export interface ViolationStats {
  totalViolations: number;
  pendingViolations: number;
  approvedViolations: number;
  rejectedViolations: number;
  totalFines: number;
}

export const api = {
  // Authentication
  async login(username: string, password: string) {
    return unifiedAPI.login(username, password, 'supervisor');
  },

  logout() {
    unifiedAPI.logout();
  },

  // Violation Management (Supervisor Functions)
  async getViolations(plateNumber?: string, status?: string): Promise<Violation[]> {
    try {
      const response = await unifiedAPI.getViolations(plateNumber, status);
      if (response.error) {
        throw new Error(response.error);
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Get violations error:', error);
      throw error;
    }
  },

  async getPendingViolations(): Promise<Violation[]> {
    return this.getViolations(undefined, 'pending');
  },

  async approveViolation(violationId: string): Promise<void> {
    try {
      const response = await unifiedAPI.approveViolation(violationId);
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Approve violation error:', error);
      throw error;
    }
  },

  async rejectViolation(violationId: string, reason: string): Promise<void> {
    try {
      const response = await unifiedAPI.rejectViolation(violationId, reason);
      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Reject violation error:', error);
      throw error;
    }
  },

  // Vehicle lookup
  async getVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
    try {
      const response = await unifiedAPI.getVehicleByPlate(plateNumber);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || null;
    } catch (error) {
      console.error('Get vehicle by plate error:', error);
      throw error;
    }
  },

  // Analytics and Statistics
  async getViolationStats(): Promise<ViolationStats> {
    try {
      const violations = await this.getViolations();
      
      const stats: ViolationStats = {
        totalViolations: violations.length,
        pendingViolations: violations.filter(v => v.status === 'pending').length,
        approvedViolations: violations.filter(v => v.status === 'approved').length,
        rejectedViolations: violations.filter(v => v.status === 'rejected').length,
        totalFines: violations.reduce((sum, v) => sum + (v.fine_amount || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Get violation stats error:', error);
      throw error;
    }
  },

  async getRecentActivity(): Promise<Violation[]> {
    try {
      const violations = await this.getViolations();
      // Return last 10 violations sorted by creation date
      return violations
        .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Get recent activity error:', error);
      throw error;
    }
  },

  // Bulk operations for supervisor workflow
  async bulkApproveViolations(violationIds: string[]): Promise<void> {
    try {
      await Promise.all(violationIds.map(id => this.approveViolation(id)));
    } catch (error) {
      console.error('Bulk approve violations error:', error);
      throw error;
    }
  },

  async bulkRejectViolations(violationIds: string[], reason: string): Promise<void> {
    try {
      await Promise.all(violationIds.map(id => this.rejectViolation(id, reason)));
    } catch (error) {
      console.error('Bulk reject violations error:', error);
      throw error;
    }
  }
};

export default api;
