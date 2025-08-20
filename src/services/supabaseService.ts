import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type User = Database['public']['Tables']['users']['Row']
type Vehicle = Database['public']['Tables']['vehicles']['Row']
type Violation = Database['public']['Tables']['violations']['Row']
type PendingApproval = Database['public']['Tables']['pending_approvals']['Row']

// User Management
export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new user
  async createUser(user: Database['public']['Tables']['users']['Insert']): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update user
  async updateUser(id: string, updates: Database['public']['Tables']['users']['Update']): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Vehicle Management
export const vehicleService = {
  // Get all vehicles
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get vehicle by plate number
  async getVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('plate_number', plateNumber)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new vehicle
  async createVehicle(vehicle: Database['public']['Tables']['vehicles']['Insert']): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update vehicle
  async updateVehicle(id: string, updates: Database['public']['Tables']['vehicles']['Update']): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Search vehicles
  async searchVehicles(query: string): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .or(`plate_number.ilike.%${query}%,owner_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Violation Management
export const violationService = {
  // Get all violations
  async getViolations(): Promise<Violation[]> {
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get violations by plate number
  async getViolationsByPlate(plateNumber: string): Promise<Violation[]> {
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .eq('plate_number', plateNumber)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Create new violation
  async createViolation(violation: Database['public']['Tables']['violations']['Insert']): Promise<Violation> {
    const { data, error } = await supabase
      .from('violations')
      .insert(violation)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update violation status
  async updateViolationStatus(id: string, status: Violation['status']): Promise<Violation> {
    const { data, error } = await supabase
      .from('violations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get violations by status
  async getViolationsByStatus(status: Violation['status']): Promise<Violation[]> {
    const { data, error } = await supabase
      .from('violations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Pending Approvals Management
export const approvalService = {
  // Get all pending approvals
  async getPendingApprovals(): Promise<PendingApproval[]> {
    const { data, error } = await supabase
      .from('pending_approvals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Create new approval request
  async createApprovalRequest(approval: Database['public']['Tables']['pending_approvals']['Insert']): Promise<PendingApproval> {
    const { data, error } = await supabase
      .from('pending_approvals')
      .insert(approval)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update approval status
  async updateApprovalStatus(id: string, status: PendingApproval['status']): Promise<PendingApproval> {
    const { data, error } = await supabase
      .from('pending_approvals')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get approvals by status
  async getApprovalsByStatus(status: PendingApproval['status']): Promise<PendingApproval[]> {
    const { data, error } = await supabase
      .from('pending_approvals')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// Authentication helper
export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }
}
