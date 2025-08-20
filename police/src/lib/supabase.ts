import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      officers: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          badge_number: string;
          rank: string | null;
          department: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          badge_number: string;
          rank?: string | null;
          department?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          badge_number?: string;
          rank?: string | null;
          department?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      vehicles: {
        Row: {
          id: string;
          plate_number: string;
          vin: string;
          make: string;
          model: string;
          year: number;
          color: string | null;
          owner_name: string;
          owner_address: string | null;
          registration_status: string | null;
          registration_expiry: string | null;
          insurance_status: string | null;
          insurance_expiry: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          plate_number: string;
          vin: string;
          make: string;
          model: string;
          year: number;
          color?: string | null;
          owner_name: string;
          owner_address?: string | null;
          registration_status?: string | null;
          registration_expiry?: string | null;
          insurance_status?: string | null;
          insurance_expiry?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          plate_number?: string;
          vin?: string;
          make?: string;
          model?: string;
          year?: number;
          color?: string | null;
          owner_name?: string;
          owner_address?: string | null;
          registration_status?: string | null;
          registration_expiry?: string | null;
          insurance_status?: string | null;
          insurance_expiry?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      violations: {
        Row: {
          id: string;
          plate_number: string;
          vehicle_id: string | null;
          officer_id: string | null;
          violation_type: string;
          violation_details: string | null;
          location: string | null;
          status: string | null;
          evidence_urls: string[] | null;
          fine_amount: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          plate_number: string;
          vehicle_id?: string | null;
          officer_id?: string | null;
          violation_type: string;
          violation_details?: string | null;
          location?: string | null;
          status?: string | null;
          evidence_urls?: string[] | null;
          fine_amount?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          plate_number?: string;
          vehicle_id?: string | null;
          officer_id?: string | null;
          violation_type?: string;
          violation_details?: string | null;
          location?: string | null;
          status?: string | null;
          evidence_urls?: string[] | null;
          fine_amount?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      scans: {
        Row: {
          id: string;
          officer_id: string | null;
          plate_number: string;
          scan_type: string | null;
          scan_result: any | null;
          location: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          officer_id?: string | null;
          plate_number: string;
          scan_type?: string | null;
          scan_result?: any | null;
          location?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          officer_id?: string | null;
          plate_number?: string;
          scan_type?: string | null;
          scan_result?: any | null;
          location?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
};