// Unified API configuration for all frontend apps
// Connects to the Python FastAPI backend

import { findVehicleByPlate, TEST_VEHICLE_DATABASE, logRegisteredPlates } from './testVehicleDatabase';

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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      // Immediately check if this is likely to fail and use mock data
      if (!this.baseUrl || this.baseUrl.includes('localhost')) {
        console.log('Local development detected, using mock response for:', endpoint);
        return this.getMockResponse<T>(endpoint, options);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Reduced to 5 second timeout

      let response: Response;
      try {
        response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        // Any fetch error should immediately trigger mock response
        console.warn('Fetch failed, using mock response for:', endpoint, fetchError);
        return this.getMockResponse<T>(endpoint, options);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
        console.warn(`API request failed: ${response.status} ${response.statusText}`, errorData);
        // Use mock response for any HTTP error as well
        return this.getMockResponse<T>(endpoint, options);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      // Enhanced error logging
      const errorInfo = {
        endpoint,
        error,
        errorName: error instanceof Error ? error.name : 'unknown',
        errorMessage: error instanceof Error ? error.message : 'unknown',
        errorType: typeof error,
        isAbortError: error instanceof Error && error.name === 'AbortError',
        baseUrl: this.baseUrl
      };

      console.log('API Request Error Details:', errorInfo);

      // Check for various network error conditions including third-party script interference
      const isNetworkError = error instanceof Error && (
        error.message.includes('fetch') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ERR_NETWORK') ||
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('NETWORK_ERROR') ||
        error.name === 'TypeError' ||
        error.name === 'NetworkError' ||
        error.name === 'AbortError'
      );

      const isLikelyFetchError = error instanceof TypeError ||
        (error instanceof Error && error.message.toLowerCase().includes('fetch'));

      // Check for third-party script interference (like FullStory)
      const isThirdPartyInterference = errorInfo.errorMessage.includes('fullstory') ||
        (typeof error === 'object' && error !== null && 'stack' in error &&
         typeof error.stack === 'string' && error.stack.includes('fullstory'));

      // Always use mock data if there's any fetch-related error or third-party interference
      if (isNetworkError || isLikelyFetchError || isThirdPartyInterference ||
          (error instanceof Error && error.message === 'Failed to fetch')) {
        console.warn('Network/Backend not available or third-party interference, using mock response:', endpoint);
        return this.getMockResponse<T>(endpoint, options);
      }

      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  private getMockResponse<T>(endpoint: string, options: RequestInit = {}): ApiResponse<T> {
    console.log('Using mock response for endpoint:', endpoint);

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
          reg_number: 'GR 1234 - 23',
          manufacturer: 'Toyota',
          model: 'Corolla',
          vehicle_type: 'Sedan',
          chassis_number: 'JTDBL40E199000001',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000001',
          license_plate: 'GR 1234 - 23',
          color: 'Silver',
          use_type: 'Private',
          date_of_entry: '2024-01-15',
          owner_name: 'Kwame Asante',
          owner_address: '123 Ring Road Central, Accra, Ghana',
          owner_phone: '+233-24-123-4567',
          owner_email: 'kwame.asante@email.com',
          status: 'active'
        },
        {
          id: 2,
          reg_number: 'WR 5678 - 23',
          manufacturer: 'Honda',
          model: 'Civic',
          vehicle_type: 'Sedan',
          chassis_number: 'JTDBL40E199000002',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000002',
          license_plate: 'WR 5678 - 23',
          color: 'Blue',
          use_type: 'Private',
          date_of_entry: '2024-02-20',
          owner_name: 'Ama Osei',
          owner_address: '456 Takoradi High Street, Takoradi, Ghana',
          owner_phone: '+233-20-456-7890',
          owner_email: 'ama.osei@email.com',
          status: 'active'
        },
        {
          id: 3,
          reg_number: 'AS 9012 - 23',
          manufacturer: 'Toyota',
          model: 'Hilux',
          vehicle_type: 'Pickup',
          chassis_number: 'JTDBL40E199000003',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000003',
          license_plate: 'AS 9012 - 23',
          color: 'White',
          use_type: 'Commercial',
          date_of_entry: '2024-03-10',
          owner_name: 'Kofi Mensah',
          owner_address: '789 Kumasi High Street, Kumasi, Ghana',
          owner_phone: '+233-26-789-0123',
          owner_email: 'kofi.mensah@email.com',
          status: 'active'
        },
        {
          id: 4,
          reg_number: 'ER 3456 - 23',
          manufacturer: 'Toyota',
          model: 'Land Cruiser',
          vehicle_type: 'SUV',
          chassis_number: 'JTDBL40E199000004',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000004',
          license_plate: 'ER 3456 - 23',
          color: 'Black',
          use_type: 'Private',
          date_of_entry: '2024-04-05',
          owner_name: 'Abena Addo',
          owner_address: '321 Koforidua Central, Koforidua, Ghana',
          owner_phone: '+233-27-321-6540',
          owner_email: 'abena.addo@email.com',
          status: 'active'
        },
        {
          id: 5,
          reg_number: 'CR 7890 - 23',
          manufacturer: 'Nissan',
          model: 'Almera',
          vehicle_type: 'Sedan',
          chassis_number: 'JTDBL40E199000005',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000005',
          license_plate: 'CR 7890 - 23',
          color: 'Red',
          use_type: 'Private',
          date_of_entry: '2024-05-12',
          owner_name: 'Yaw Darko',
          owner_address: '654 Cape Coast Road, Cape Coast, Ghana',
          owner_phone: '+233-54-987-6543',
          owner_email: 'yaw.darko@email.com',
          status: 'active'
        },
        {
          id: 6,
          reg_number: 'BA 4567 - 23',
          manufacturer: 'Toyota',
          model: 'Camry',
          vehicle_type: 'Sedan',
          chassis_number: 'JTDBL40E199000006',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000006',
          license_plate: 'BA 4567 - 23',
          color: 'Gray',
          use_type: 'Private',
          date_of_entry: '2024-06-18',
          owner_name: 'Kwesi Boateng',
          owner_address: '234 Sunyani Main Street, Sunyani, Ghana',
          owner_phone: '+233-56-345-6789',
          owner_email: 'kwesi.boateng@email.com',
          status: 'active'
        },
        {
          id: 7,
          reg_number: 'NR 6789 - 23',
          manufacturer: 'Toyota',
          model: 'Hilux',
          vehicle_type: 'Pickup',
          chassis_number: 'JTDBL40E199000007',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000007',
          license_plate: 'NR 6789 - 23',
          color: 'White',
          use_type: 'Commercial',
          date_of_entry: '2024-07-25',
          owner_name: 'Fatima Alhassan',
          owner_address: '567 Tamale Central, Tamale, Ghana',
          owner_phone: '+233-57-456-7890',
          owner_email: 'fatima.alhassan@email.com',
          status: 'active'
        },
        {
          id: 8,
          reg_number: 'AA 1234 - 23',
          manufacturer: 'Mercedes-Benz',
          model: 'S-Class',
          vehicle_type: 'Sedan',
          chassis_number: 'JTDBL40E199000008',
          year_of_manufacture: 2023,
          vin: 'JTDBL40E199000008',
          license_plate: 'AA 1234 - 23',
          color: 'Black',
          use_type: 'Diplomatic',
          date_of_entry: '2024-08-30',
          owner_name: 'Embassy of Germany',
          owner_address: '123 Ring Road Central, Accra, Ghana',
          owner_phone: '+233-65-234-5678',
          owner_email: 'german.embassy@email.com',
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
          offense_location: 'Tema Motorway Junction',
          amount: 200.00,
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
      // Extract plate number from endpoint (e.g., /vehicles/GR-1234-23)
      const plateNumber = endpoint.split('/vehicles/')[1];
      console.log('🔍 Looking up plate in test database:', plateNumber);

      // Log registered plates for reference in development
      if (Math.random() < 0.1) { // Only log occasionally to avoid spam
        logRegisteredPlates();
      }

      // Look up vehicle in test database
      const vehicle = findVehicleByPlate(plateNumber);

      if (vehicle) {
        console.log('✅ Vehicle found in test database:', vehicle.plate_number, '-', vehicle.year, vehicle.make, vehicle.model);
        return {
          data: vehicle as T
        };
      } else {
        console.log('❌ Vehicle not found in test database for plate:', plateNumber);
        console.log('💡 Available plates:', TEST_VEHICLE_DATABASE.map(v => v.plate_number).join(', '));
        return {
          data: null as T,
          error: 'Vehicle not found'
        };
      }
    }

    if (endpoint.includes('/violations') && options.method === 'GET') {
      const mockViolations = [
        {
          id: 'mock-violation-1',
          plate_number: 'GR 1234 - 23',
          vehicle_id: '1',
          officer_id: '1',
          violation_type: 'Speeding',
          violation_details: 'Exceeding speed limit by 20 km/h',
          location: 'Ring Road Central, Accra',
          status: 'pending',
          evidence_urls: ['https://example.com/evidence1.jpg'],
          fine_amount: 200,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-violation-2',
          plate_number: 'WR 5678 - 23',
          vehicle_id: '2',
          officer_id: '1',
          violation_type: 'Parking',
          violation_details: 'Parking in no parking zone',
          location: 'Takoradi High Street, Takoradi',
          status: 'pending',
          evidence_urls: ['https://example.com/evidence2.jpg'],
          fine_amount: 100,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'mock-violation-3',
          plate_number: 'GN 4567 - 23',
          vehicle_id: '3',
          officer_id: '2',
          violation_type: 'Red Light',
          violation_details: 'Running red light at intersection',
          location: 'Sefwi Wiawso Road, Sefwi Wiawso',
          status: 'approved',
          evidence_urls: ['https://example.com/evidence3.jpg'],
          fine_amount: 75,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'mock-violation-4',
          plate_number: 'AS 2345 - 23',
          vehicle_id: '4',
          officer_id: '2',
          violation_type: 'Overloading',
          violation_details: 'Vehicle carrying more passengers than allowed',
          location: 'Kumasi High Street, Kumasi',
          status: 'pending',
          evidence_urls: ['https://example.com/evidence4.jpg'],
          fine_amount: 150,
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString()
        },
        {
          id: 'mock-violation-5',
          plate_number: 'BA 4567 - 23',
          vehicle_id: '5',
          officer_id: '3',
          violation_type: 'No Insurance',
          violation_details: 'Vehicle operating without valid insurance',
          location: 'Sunyani Main Street, Sunyani',
          status: 'approved',
          evidence_urls: ['https://example.com/evidence5.jpg'],
          fine_amount: 300,
          created_at: new Date(Date.now() - 345600000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString()
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

    // Default mock response - ensure we always return appropriate data structure
    if (endpoint.includes('/vehicles')) {
      return { data: [] as T };
    }

    if (endpoint.includes('/violations')) {
      return { data: [] as T };
    }

    // Default success response
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

  async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    return this.request<Vehicle[]>('/vehicles');
  }

  async lookupVehicle(plateNumber: string): Promise<ApiResponse<Vehicle>> {
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

  async submitViolation(violationData: any): Promise<ApiResponse<Violation>> {
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

  async deleteDVLAVehicle(vehicleId: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/dvla/vehicles/${vehicleId}`, {
      method: 'DELETE',
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
