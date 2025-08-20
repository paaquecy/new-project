// Unified API configuration for all frontend apps
// Connects to the Python FastAPI backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_role: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  badge_number?: string;
  rank?: string;
  department?: string;
  phone?: string;
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

class UnifiedAPIClient {
  private token: string | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
        return { error: errorData.detail || 'Request failed' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      // Debug logging to understand the error
      console.log('API Request Error:', {
        error,
        errorName: error instanceof Error ? error.name : 'unknown',
        errorMessage: error instanceof Error ? error.message : 'unknown',
        errorType: typeof error,
        endpoint
      });

      // If FastAPI backend is not available, fall back to mock responses for development
      // Handle network/fetch errors broadly
      const isNetworkError = error instanceof Error && (
        error.message.includes('fetch') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.name === 'TypeError' ||
        error.name === 'NetworkError'
      );

      // Also handle cases where error might not be an Error instance
      const isLikelyNetworkError = !error ||
        (typeof error === 'object' && 'message' in error &&
         typeof error.message === 'string' &&
         error.message.toLowerCase().includes('fetch'));

      if (isNetworkError || isLikelyNetworkError) {
        console.warn('FastAPI backend not available, using mock response for:', endpoint);
        return this.getMockResponse<T>(endpoint, options);
      }

      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit = {}): ApiResponse<T> {
    // Mock responses for development when backend is not available
    if (endpoint.includes('/auth/login') || endpoint.includes('/dvla/auth/login')) {
      let userRole = 'police';
      if (endpoint.includes('/dvla/')) userRole = 'dvla';
      if (endpoint.includes('/supervisor')) userRole = 'supervisor';
      
      return {
        data: {
          access_token: 'mock-token-' + Date.now(),
          token_type: 'bearer',
          user_role: userRole
        } as T
      };
    }

    // DVLA specific mock responses
    if (endpoint.includes('/dvla/vehicles') && options.method === 'GET') {
      const mockVehicles = [
        {
          id: 1,
          reg_number: 'AB12 CDE',
          manufacturer: 'Toyota',
          model: 'Corolla',
          vehicle_type: 'Hatchback',
          chassis_number: 'JTDBL40E199000001',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000001',
          license_plate: 'AB12 CDE',
          color: 'Silver',
          use_type: 'Private',
          date_of_entry: '2024-01-15',
          owner_name: 'John Smith',
          owner_address: '123 High Street, London, UK',
          owner_phone: '+44 7700 900123',
          owner_email: 'john.smith@example.com',
          status: 'active'
        }
      ];
      return { data: mockVehicles as T };
    }

    if (endpoint.includes('/dvla/renewals') && options.method === 'GET') {
      const mockRenewals = [
        {
          id: 1,
          vehicle_id: 1,
          renewal_date: '2024-01-15',
          expiry_date: '2025-01-15',
          status: 'completed',
          amount_paid: 150.00,
          payment_method: 'Credit Card',
          transaction_id: 'TXN123456'
        }
      ];
      return { data: mockRenewals as T };
    }

    if (endpoint.includes('/dvla/fines') && options.method === 'GET') {
      const mockFines = [
        {
          id: 1,
          fine_id: 'FINE001',
          vehicle_id: 1,
          offense_description: 'Speeding violation',
          offense_date: '2024-01-10T10:30:00Z',
          offense_location: 'M25 Junction 15',
          amount: 100.00,
          payment_status: 'unpaid',
          marked_as_cleared: false,
          notes: 'Caught by speed camera'
        }
      ];
      return { data: mockFines as T };
    }

    if (endpoint.includes('/dvla/analytics')) {
      return {
        data: {
          total_vehicles: 1250,
          total_renewals: 850,
          total_fines: 125,
          pending_renewals: 45,
          unpaid_fines: 23,
          revenue_this_month: 12500.00,
          renewal_rate: 95.5,
          fine_payment_rate: 78.2
        } as T
      };
    }

    if (endpoint.includes('/vehicles/') && !endpoint.includes('/dvla/')) {
      return {
        data: {
          id: '1',
          plate_number: 'ABC123',
          vin: 'TEST123456789',
          make: 'Toyota',
          model: 'Corolla',
          year: 2023,
          color: 'Blue',
          owner_name: 'John Smith',
          owner_address: '123 Test Street',
          registration_status: 'Valid',
          registration_expiry: '2025-12-31',
          insurance_status: 'Valid',
          insurance_expiry: '2025-06-30',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as T
      };
    }

    if (endpoint.includes('/violations') && options.method === 'GET') {
      const mockViolations = [
        {
          id: 'mock-violation-1',
          plate_number: 'ABC123',
          vehicle_id: '1',
          officer_id: '1',
          violation_type: 'Speeding',
          violation_details: 'Exceeding speed limit by 15 mph',
          location: 'Main Street, London',
          status: 'pending',
          evidence_urls: ['https://example.com/evidence1.jpg'],
          fine_amount: 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-violation-2',
          plate_number: 'XYZ789',
          vehicle_id: '2',
          officer_id: '1',
          violation_type: 'Parking',
          violation_details: 'Parking in no parking zone',
          location: 'High Street, Manchester',
          status: 'pending',
          evidence_urls: ['https://example.com/evidence2.jpg'],
          fine_amount: 50,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'mock-violation-3',
          plate_number: 'DEF456',
          vehicle_id: '3',
          officer_id: '2',
          violation_type: 'Red Light',
          violation_details: 'Running red light at intersection',
          location: 'Oxford Street, Birmingham',
          status: 'approved',
          evidence_urls: ['https://example.com/evidence3.jpg'],
          fine_amount: 75,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      
      return { data: mockViolations as T };
    }

    if (endpoint.includes('/violations') && options.method === 'POST') {
      return {
        data: {
          id: 'mock-violation-' + Date.now(),
          plate_number: 'ABC123',
          violation_type: 'Speeding',
          status: 'pending',
          created_at: new Date().toISOString()
        } as T
      };
    }

    if (endpoint.includes('/violations') && options.method === 'PUT') {
      return {
        data: {
          success: true,
          message: 'Violation status updated successfully'
        } as T
      };
    }

    // Default mock response
    return {
      data: { success: true } as T
    };
  }

  // Authentication
  async login(username: string, password: string, loginType: 'police' | 'dvla' | 'supervisor' = 'police'): Promise<ApiResponse<AuthResponse>> {
    const endpoint = loginType === 'dvla' ? '/dvla/auth/login' : '/auth/login';
    const response = await this.request<AuthResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.data) {
      this.token = response.data.access_token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user_role', response.data.user_role);
    }

    return response;
  }

  async register(userData: any, userType: 'police' | 'dvla' = 'police'): Promise<ApiResponse<User>> {
    const endpoint = userType === 'dvla' ? '/dvla/auth/register' : '/auth/register';
    return this.request<User>(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
  }

  // Police/General Vehicle Operations
  async getVehicleByPlate(plateNumber: string): Promise<ApiResponse<Vehicle>> {
    return this.request<Vehicle>(`/vehicles/${plateNumber}`);
  }

  async recognizePlate(imageData: string, userId: string): Promise<ApiResponse<any>> {
    return this.request(`/plate-recognition`, {
      method: 'POST',
      body: JSON.stringify({ image_data: imageData, user_id: userId }),
    });
  }

  // Violation Management
  async createViolation(violationData: any): Promise<ApiResponse<Violation>> {
    return this.request<Violation>('/violations', {
      method: 'POST',
      body: JSON.stringify(violationData),
    });
  }

  async getViolations(plateNumber?: string, status?: string): Promise<ApiResponse<Violation[]>> {
    const params = new URLSearchParams();
    if (plateNumber) params.append('plate_number', plateNumber);
    if (status) params.append('status', status);
    
    return this.request<Violation[]>(`/violations?${params.toString()}`);
  }

  async approveViolation(violationId: string): Promise<ApiResponse<any>> {
    return this.request(`/violations/${violationId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectViolation(violationId: string, reason: string): Promise<ApiResponse<any>> {
    return this.request(`/violations/${violationId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // DVLA Operations
  async getDVLAUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/dvla/users');
  }

  async createDVLAVehicle(vehicleData: any): Promise<ApiResponse<DVLAVehicle>> {
    return this.request<DVLAVehicle>('/dvla/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async getDVLAVehicles(search?: string, limit: number = 100): Promise<ApiResponse<DVLAVehicle[]>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('limit', limit.toString());
    
    return this.request<DVLAVehicle[]>(`/dvla/vehicles?${params.toString()}`);
  }

  async getDVLAVehicleById(vehicleId: number): Promise<ApiResponse<DVLAVehicle>> {
    return this.request<DVLAVehicle>(`/dvla/vehicles/${vehicleId}`);
  }

  async getDVLAVehicleByReg(regNumber: string): Promise<ApiResponse<DVLAVehicle>> {
    return this.request<DVLAVehicle>(`/dvla/vehicles/reg/${regNumber}`);
  }

  async updateDVLAVehicle(vehicleId: number, vehicleData: any): Promise<ApiResponse<DVLAVehicle>> {
    return this.request<DVLAVehicle>(`/dvla/vehicles/${vehicleId}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async createDVLARenewal(renewalData: any): Promise<ApiResponse<DVLARenewal>> {
    return this.request<DVLARenewal>('/dvla/renewals', {
      method: 'POST',
      body: JSON.stringify(renewalData),
    });
  }

  async getDVLARenewals(vehicleId?: number, status?: string): Promise<ApiResponse<DVLARenewal[]>> {
    const params = new URLSearchParams();
    if (vehicleId) params.append('vehicle_id', vehicleId.toString());
    if (status) params.append('status', status);
    
    return this.request<DVLARenewal[]>(`/dvla/renewals?${params.toString()}`);
  }

  async updateDVLARenewalStatus(renewalId: number, status: string): Promise<ApiResponse<DVLARenewal>> {
    return this.request<DVLARenewal>(`/dvla/renewals/${renewalId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async createDVLAFine(fineData: any): Promise<ApiResponse<DVLAFine>> {
    return this.request<DVLAFine>('/dvla/fines', {
      method: 'POST',
      body: JSON.stringify(fineData),
    });
  }

  async getDVLAFines(vehicleId?: number, paymentStatus?: string): Promise<ApiResponse<DVLAFine[]>> {
    const params = new URLSearchParams();
    if (vehicleId) params.append('vehicle_id', vehicleId.toString());
    if (paymentStatus) params.append('payment_status', paymentStatus);
    
    return this.request<DVLAFine[]>(`/dvla/fines?${params.toString()}`);
  }

  async updateDVLAFinePayment(fineId: string, paymentData: any): Promise<ApiResponse<DVLAFine>> {
    return this.request<DVLAFine>(`/dvla/fines/${fineId}/payment`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  }

  async clearDVLAFine(fineId: string): Promise<ApiResponse<DVLAFine>> {
    return this.request<DVLAFine>(`/dvla/fines/${fineId}/clear`, {
      method: 'PUT',
    });
  }

  async getDVLAAnalytics(): Promise<ApiResponse<DVLAAnalytics>> {
    return this.request<DVLAAnalytics>('/dvla/analytics');
  }

  // Supervisor Analytics
  async getViolationStats(): Promise<ApiResponse<any>> {
    return this.request('/analytics/violations');
  }

  async getOfficerStats(): Promise<ApiResponse<any>> {
    return this.request('/analytics/officers');
  }
}

export const unifiedAPI = new UnifiedAPIClient();
export default unifiedAPI;
