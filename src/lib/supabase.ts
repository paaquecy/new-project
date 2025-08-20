import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate Supabase URL format
const isValidSupabaseUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes('supabase') && parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

// Create a mock Supabase client for development when environment variables are not set
const createMockSupabaseClient = () => {
  console.log('Using mock Supabase client - Supabase not configured');
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    })
  };
};

// Create Supabase client only if valid credentials are provided
const createSupabaseClient = () => {
  if (!isValidSupabaseUrl(supabaseUrl) || !supabaseAnonKey) {
    return createMockSupabaseClient();
  }

  try {
    console.log('Creating Supabase client with URL:', supabaseUrl);
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return createMockSupabaseClient();
  }
};

export const supabase = createSupabaseClient();

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
