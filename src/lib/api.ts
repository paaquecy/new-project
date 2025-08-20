import { unifiedAPI } from './unified-api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  badge_number?: string;
  rank?: string;
  department?: string;
  role: 'admin' | 'police' | 'dvla' | 'supervisor';
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  owner_name: string;
  owner_address?: string;
  registration_status?: string;
  registration_expiry?: string;
  insurance_status?: string;
  insurance_expiry?: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface ViolationSubmission {
  plateNumber: string;
  violationType: string;
  violationDetails: string;
  location?: string;
  fineAmount?: number;
  evidenceUrls?: string[];
}

export interface VehicleLookupResult {
  vehicle: Vehicle | null;
  violations: Violation[];
  outstandingViolations: number;
}

export interface AuthResponse {
  user: User;
  session: any;
}

class ApiClient {
  private currentUser: User | null = null;
  private currentSession: any = null;

  // Authentication
  async signIn(email: string, password: string): Promise<{ data: AuthResponse | null; error: any }> {
    try {
      const response = await unifiedAPI.login(email, password, 'police');

      if (response.error) {
        return { data: null, error: { message: response.error } };
      }

      if (!response.data) {
        return { data: null, error: { message: 'No response data' } };
      }

      // Mock user data for now - will be enhanced when user profile endpoints are available
      const user: User = {
        id: '1',
        email: email,
        full_name: 'Officer John Smith',
        badge_number: 'P001',
        rank: 'Officer',
        department: 'Traffic Division',
        role: 'police',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.currentUser = user;
      this.currentSession = { access_token: response.data.access_token };

      return { data: { user, session: this.currentSession }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signUp(email: string, password: string, metadata: any): Promise<{ data: any; error: any }> {
    try {
      const response = await unifiedAPI.register({
        username: metadata.badge_number || email,
        email: email,
        password: password,
        full_name: metadata.full_name,
        role: 'police',
        badge_number: metadata.badge_number,
        rank: metadata.rank,
        department: metadata.department,
      }, 'police');

      if (response.error) {
        return { data: null, error: { message: response.error } };
      }

      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signOut(): Promise<{ error: any }> {
    try {
      unifiedAPI.logout();
      this.currentUser = null;
      this.currentSession = null;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Vehicle operations
  async lookupVehicle(plateNumber: string): Promise<VehicleLookupResult> {
    try {
      // Get vehicle information
      const vehicleResponse = await unifiedAPI.getVehicleByPlate(plateNumber);
      let vehicle = null;
      
      if (vehicleResponse.data) {
        const data = vehicleResponse.data;
        vehicle = {
          id: data.id.toString(),
          plate_number: data.plate_number || data.reg_number || '',
          vin: data.vin,
          make: data.make || data.manufacturer || '',
          model: data.model,
          year: data.year || data.year_of_manufacture || 0,
          color: data.color,
          owner_name: data.owner_name,
          owner_address: data.owner_address,
          registration_status: data.registration_status || data.status,
          registration_expiry: data.registration_expiry,
          insurance_status: data.insurance_status,
          insurance_expiry: data.insurance_expiry,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };
      }

      // Get violations for this plate
      const violationsResponse = await unifiedAPI.getViolations(plateNumber);
      const violations = Array.isArray(violationsResponse.data) ? violationsResponse.data : [];

      const mappedViolations = violations.map(v => ({
        id: v.id,
        plate_number: v.plate_number,
        vehicle_id: v.vehicle_id,
        officer_id: v.officer_id,
        violation_type: v.violation_type,
        violation_details: v.violation_details,
        location: v.location,
        status: v.status,
        evidence_urls: v.evidence_urls,
        fine_amount: v.fine_amount,
        created_at: v.created_at || new Date().toISOString(),
        updated_at: v.updated_at || new Date().toISOString(),
      }));

      const outstandingViolations = mappedViolations.filter(v => v.status === 'pending').length;

      return {
        vehicle,
        violations: mappedViolations,
        outstandingViolations,
      };
    } catch (error) {
      console.error('Vehicle lookup error:', error);
      throw error;
    }
  }

  async getVehicles(): Promise<Vehicle[]> {
    try {
      // This would use a general vehicles endpoint when available
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Get vehicles error:', error);
      throw error;
    }
  }

  // Violation operations
  async submitViolation(violation: ViolationSubmission): Promise<Violation> {
    try {
      const response = await unifiedAPI.createViolation({
        plate_number: violation.plateNumber,
        violation_type: violation.violationType,
        violation_details: violation.violationDetails,
        location: violation.location,
        fine_amount: violation.fineAmount,
        evidence_urls: violation.evidenceUrls,
        officer_id: this.currentUser?.id,
        status: 'pending',
      });

      if (response.error || !response.data) {
        throw new Error(response.error || 'Failed to submit violation');
      }

      const data = response.data;
      return {
        id: data.id,
        plate_number: data.plate_number,
        vehicle_id: data.vehicle_id,
        officer_id: data.officer_id,
        violation_type: data.violation_type,
        violation_details: data.violation_details,
        location: data.location,
        status: data.status,
        evidence_urls: data.evidence_urls,
        fine_amount: data.fine_amount,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Submit violation error:', error);
      throw error;
    }
  }

  async getViolations(): Promise<Violation[]> {
    try {
      const response = await unifiedAPI.getViolations();

      if (response.error || !response.data) {
        return [];
      }

      // Ensure response.data is an array
      const violationsData = Array.isArray(response.data) ? response.data : [];

      return violationsData.map(v => ({
        id: v.id,
        plate_number: v.plate_number,
        vehicle_id: v.vehicle_id,
        officer_id: v.officer_id,
        violation_type: v.violation_type,
        violation_details: v.violation_details,
        location: v.location,
        status: v.status,
        evidence_urls: v.evidence_urls,
        fine_amount: v.fine_amount,
        created_at: v.created_at || new Date().toISOString(),
        updated_at: v.updated_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Get violations error:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async updateViolationStatus(violationId: string, status: string, rejectionReason?: string): Promise<void> {
    try {
      if (status.toLowerCase() === 'approved') {
        const response = await unifiedAPI.approveViolation(violationId);
        if (response.error) {
          throw new Error(response.error);
        }
      } else if (status.toLowerCase() === 'rejected') {
        const response = await unifiedAPI.rejectViolation(violationId, rejectionReason || '');
        if (response.error) {
          throw new Error(response.error);
        }
      }
    } catch (error) {
      console.error('Update violation status error:', error);
      throw error;
    }
  }

  // Scan operations - keeping for compatibility
  async recordScan(plateNumber: string, scanType: string = 'Manual', scanResult: any = {}, location?: string): Promise<void> {
    try {
      // This would be implemented when scan recording endpoint is available
      console.log('Recording scan:', { plateNumber, scanType, scanResult, location });
    } catch (error) {
      console.error('Record scan error:', error);
      throw error;
    }
  }

  // File upload - keeping for compatibility
  async uploadFile(file: File, bucket: string = 'evidence'): Promise<string> {
    try {
      // This would be implemented when file upload endpoint is available
      // For now, return a mock URL
      return `https://mock-upload-url.com/${file.name}`;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  // Utility methods
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentSession(): any {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.currentSession;
  }
}

export const api = new ApiClient();
