import { unifiedAPI } from './unified-api';

export interface VehicleLookupResult {
  vehicle: any;
  violations: any[];
  outstandingViolations: number;
}

export interface ViolationSubmission {
  plateNumber: string;
  violationType: string;
  violationDetails: string;
  location?: string;
  officerId?: string;
}

export const api = {
  // Vehicle lookup
  async lookupVehicle(plateNumber: string): Promise<VehicleLookupResult> {
    try {
      // Get vehicle information
      const vehicleResponse = await unifiedAPI.getVehicleByPlate(plateNumber);

      // Get violations for this plate
      const violationsResponse = await unifiedAPI.getViolations(plateNumber);

      const vehicle = vehicleResponse.data || null;
      const violations = Array.isArray(violationsResponse.data) ? violationsResponse.data : [];
      const outstandingViolations = violations.filter(v => v.status === 'pending').length;

      return {
        vehicle,
        violations,
        outstandingViolations
      };
    } catch (error) {
      console.error('Vehicle lookup error:', error);
      throw error;
    }
  },

  // Submit violation
  async submitViolation(violation: ViolationSubmission) {
    try {
      const response = await unifiedAPI.createViolation({
        plate_number: violation.plateNumber,
        violation_type: violation.violationType,
        violation_details: violation.violationDetails,
        location: violation.location,
        officer_id: violation.officerId || '1', // Default officer ID
        status: 'pending'
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    } catch (error) {
      console.error('Submit violation error:', error);
      throw error;
    }
  },

  // Get violations
  async getViolations() {
    try {
      const response = await unifiedAPI.getViolations();

      if (response.error) {
        throw new Error(response.error);
      }

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Get violations error:', error);
      throw error;
    }
  },

  // Get vehicles - for police this would be from general vehicle database
  async getVehicles() {
    try {
      // Since police typically look up vehicles by plate, return empty array
      // This could be enhanced to return recent scanned vehicles
      return [];
    } catch (error) {
      console.error('Get vehicles error:', error);
      throw error;
    }
  },

  // Record scan
  async recordScan(plateNumber: string, scanType: string = 'Manual', scanResult: any = {}, location?: string) {
    try {
      // For now, just log the scan - this could be enhanced to store scan records
      console.log('Recording scan:', { plateNumber, scanType, scanResult, location });

      // Return mock scan data
      return {
        id: 'scan-' + Date.now(),
        plate_number: plateNumber,
        scan_type: scanType,
        scan_result: scanResult,
        location: location,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Record scan error:', error);
      throw error;
    }
  },

  // Authentication helpers
  async login(username: string, password: string) {
    return unifiedAPI.login(username, password, 'police');
  },

  logout() {
    unifiedAPI.logout();
  }
};
