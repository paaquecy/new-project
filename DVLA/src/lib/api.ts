import { unifiedAPI } from './unified-api';

export interface DVLAUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface DVLAVehicle {
  id: number;
  reg_number: string;
  manufacturer: string;
  model: string;
  vehicle_type: string;
  chassis_number: string;
  year_of_manufacture: number;
  vin: string;
  license_plate: string;
  color: string;
  use_type: string;
  date_of_entry: string;
  owner_name: string;
  owner_address: string;
  owner_phone: string;
  owner_email: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface DVLARenewal {
  id: number;
  vehicle_id: number;
  renewal_date: string;
  expiry_date: string;
  status: string;
  amount_paid?: number;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DVLAFine {
  id: number;
  fine_id: string;
  vehicle_id: number;
  offense_description: string;
  offense_date: string;
  offense_location: string;
  amount: number;
  payment_status: string;
  payment_method?: string;
  marked_as_cleared: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DVLAAnalytics {
  total_vehicles: number;
  total_renewals: number;
  total_fines: number;
  pending_renewals: number;
  unpaid_fines: number;
  revenue_this_month: number;
  renewal_rate: number;
  fine_payment_rate: number;
}

export const api = {
  // Authentication
  async login(username: string, password: string) {
    return unifiedAPI.login(username, password, 'dvla');
  },

  logout() {
    unifiedAPI.logout();
  },

  // User Management
  async getUsers(): Promise<DVLAUser[]> {
    try {
      const response = await unifiedAPI.getDVLAUsers();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Vehicle Management
  async getVehicles(search?: string, limit: number = 100): Promise<DVLAVehicle[]> {
    try {
      const response = await unifiedAPI.getDVLAVehicles(search, limit);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    } catch (error) {
      console.error('Get vehicles error:', error);
      throw error;
    }
  },

  async getVehicleById(vehicleId: number): Promise<DVLAVehicle | null> {
    try {
      const response = await unifiedAPI.getDVLAVehicleById(vehicleId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || null;
    } catch (error) {
      console.error('Get vehicle by ID error:', error);
      throw error;
    }
  },

  async getVehicleByReg(regNumber: string): Promise<DVLAVehicle | null> {
    try {
      const response = await unifiedAPI.getDVLAVehicleByReg(regNumber);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || null;
    } catch (error) {
      console.error('Get vehicle by registration error:', error);
      throw error;
    }
  },

  async createVehicle(vehicleData: Omit<DVLAVehicle, 'id' | 'created_at' | 'updated_at'>): Promise<DVLAVehicle> {
    try {
      const response = await unifiedAPI.createDVLAVehicle(vehicleData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (error) {
      console.error('Create vehicle error:', error);
      throw error;
    }
  },

  async updateVehicle(vehicleId: number, vehicleData: Partial<DVLAVehicle>): Promise<DVLAVehicle> {
    try {
      const response = await unifiedAPI.updateDVLAVehicle(vehicleId, vehicleData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (error) {
      console.error('Update vehicle error:', error);
      throw error;
    }
  },

  // Renewal Management
  async getRenewals(vehicleId?: number, status?: string): Promise<DVLARenewal[]> {
    try {
      const response = await unifiedAPI.getDVLARenewals(vehicleId, status);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    } catch (error) {
      console.error('Get renewals error:', error);
      throw error;
    }
  },

  async createRenewal(renewalData: Omit<DVLARenewal, 'id' | 'created_at' | 'updated_at'>): Promise<DVLARenewal> {
    try {
      const response = await unifiedAPI.createDVLARenewal(renewalData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (error) {
      console.error('Create renewal error:', error);
      throw error;
    }
  },

  async updateRenewalStatus(renewalId: number, status: string): Promise<DVLARenewal> {
    try {
      const response = await unifiedAPI.updateDVLARenewalStatus(renewalId, status);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (error) {
      console.error('Update renewal status error:', error);
      throw error;
    }
  },

  // Fine Management
  async getFines(vehicleId?: number, paymentStatus?: string): Promise<DVLAFine[]> {
    try {
      const response = await unifiedAPI.getDVLAFines(vehicleId, paymentStatus);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    } catch (error) {
      console.error('Get fines error:', error);
      throw error;
    }
  },

  async createFine(fineData: Omit<DVLAFine, 'id' | 'created_at' | 'updated_at'>): Promise<DVLAFine> {
    try {
      const response = await unifiedAPI.createDVLAFine(fineData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (error) {
      console.error('Create fine error:', error);
      throw error;
    }
  },

  async updateFinePayment(fineId: string, paymentData: any): Promise<DVLAFine> {
    try {
      const response = await unifiedAPI.updateDVLAFinePayment(fineId, paymentData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (error) {
      console.error('Update fine payment error:', error);
      throw error;
    }
  },

  async clearFine(fineId: string): Promise<DVLAFine> {
    try {
      const response = await unifiedAPI.clearDVLAFine(fineId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (error) {
      console.error('Clear fine error:', error);
      throw error;
    }
  },

  // Analytics
  async getAnalytics(): Promise<DVLAAnalytics> {
    try {
      const response = await unifiedAPI.getDVLAAnalytics();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  }
};

export default api;
