import os
from supabase import create_client, Client
from typing import Dict, List, Optional, Any
from datetime import datetime, date
import json

class SupabaseClient:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_SERVICE_KEY')  # Use service key for backend
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
    
    # User Management
    def get_users(self) -> List[Dict]:
        """Get all users"""
        try:
            response = self.client.table('users').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching users: {e}")
            return []
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        try:
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None
    
    def create_user(self, user_data: Dict) -> Optional[Dict]:
        """Create new user"""
        try:
            response = self.client.table('users').insert(user_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    
    def update_user(self, user_id: str, updates: Dict) -> Optional[Dict]:
        """Update user"""
        try:
            response = self.client.table('users').update(updates).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating user: {e}")
            return None
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        try:
            self.client.table('users').delete().eq('id', user_id).execute()
            return True
        except Exception as e:
            print(f"Error deleting user: {e}")
            return False
    
    # Vehicle Management
    def get_vehicles(self) -> List[Dict]:
        """Get all vehicles"""
        try:
            response = self.client.table('vehicles').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching vehicles: {e}")
            return []
    
    def get_vehicle_by_plate(self, plate_number: str) -> Optional[Dict]:
        """Get vehicle by plate number"""
        try:
            response = self.client.table('vehicles').select('*').eq('plate_number', plate_number).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching vehicle: {e}")
            return None
    
    def create_vehicle(self, vehicle_data: Dict) -> Optional[Dict]:
        """Create new vehicle"""
        try:
            response = self.client.table('vehicles').insert(vehicle_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating vehicle: {e}")
            return None
    
    def update_vehicle(self, vehicle_id: str, updates: Dict) -> Optional[Dict]:
        """Update vehicle"""
        try:
            response = self.client.table('vehicles').update(updates).eq('id', vehicle_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating vehicle: {e}")
            return None
    
    def search_vehicles(self, query: str) -> List[Dict]:
        """Search vehicles by plate number or owner name"""
        try:
            response = self.client.table('vehicles').select('*').or_(
                f'plate_number.ilike.%{query}%,owner_name.ilike.%{query}%'
            ).execute()
            return response.data
        except Exception as e:
            print(f"Error searching vehicles: {e}")
            return []
    
    # Violation Management
    def get_violations(self) -> List[Dict]:
        """Get all violations"""
        try:
            response = self.client.table('violations').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching violations: {e}")
            return []
    
    def get_violations_by_plate(self, plate_number: str) -> List[Dict]:
        """Get violations by plate number"""
        try:
            response = self.client.table('violations').select('*').eq('plate_number', plate_number).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching violations: {e}")
            return []
    
    def create_violation(self, violation_data: Dict) -> Optional[Dict]:
        """Create new violation"""
        try:
            response = self.client.table('violations').insert(violation_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating violation: {e}")
            return None
    
    def update_violation_status(self, violation_id: str, status: str) -> Optional[Dict]:
        """Update violation status"""
        try:
            response = self.client.table('violations').update({'status': status}).eq('id', violation_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating violation: {e}")
            return None
    
    def get_violations_by_status(self, status: str) -> List[Dict]:
        """Get violations by status"""
        try:
            response = self.client.table('violations').select('*').eq('status', status).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching violations: {e}")
            return []
    
    # Pending Approvals Management
    def get_pending_approvals(self) -> List[Dict]:
        """Get all pending approvals"""
        try:
            response = self.client.table('pending_approvals').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching pending approvals: {e}")
            return []
    
    def create_approval_request(self, approval_data: Dict) -> Optional[Dict]:
        """Create new approval request"""
        try:
            response = self.client.table('pending_approvals').insert(approval_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating approval request: {e}")
            return None
    
    def update_approval_status(self, approval_id: str, status: str) -> Optional[Dict]:
        """Update approval status"""
        try:
            response = self.client.table('pending_approvals').update({'status': status}).eq('id', approval_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating approval: {e}")
            return None
    
    def get_approvals_by_status(self, status: str) -> List[Dict]:
        """Get approvals by status"""
        try:
            response = self.client.table('pending_approvals').select('*').eq('status', status).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching approvals: {e}")
            return []
    
    # Authentication
    def create_user_auth(self, email: str, password: str, user_metadata: Dict = None) -> Optional[Dict]:
        """Create user in Supabase Auth"""
        try:
            response = self.client.auth.admin.create_user({
                'email': email,
                'password': password,
                'user_metadata': user_metadata or {}
            })
            return response.user
        except Exception as e:
            print(f"Error creating auth user: {e}")
            return None
    
    def delete_user_auth(self, user_id: str) -> bool:
        """Delete user from Supabase Auth"""
        try:
            self.client.auth.admin.delete_user(user_id)
            return True
        except Exception as e:
            print(f"Error deleting auth user: {e}")
            return False
    
    # Analytics and Reporting
    def get_violation_stats(self) -> Dict:
        """Get violation statistics"""
        try:
            # Get total violations
            total_response = self.client.table('violations').select('*', count='exact').execute()
            total_violations = total_response.count or 0
            
            # Get violations by status
            pending_response = self.client.table('violations').select('*', count='exact').eq('status', 'pending').execute()
            pending_count = pending_response.count or 0
            
            approved_response = self.client.table('violations').select('*', count='exact').eq('status', 'approved').execute()
            approved_count = approved_response.count or 0
            
            paid_response = self.client.table('violations').select('*', count='exact').eq('status', 'paid').execute()
            paid_count = paid_response.count or 0
            
            # Get total fine amount
            fine_response = self.client.table('violations').select('fine_amount').execute()
            total_fines = sum(violation.get('fine_amount', 0) for violation in fine_response.data)
            
            return {
                'total_violations': total_violations,
                'pending_violations': pending_count,
                'approved_violations': approved_count,
                'paid_violations': paid_count,
                'total_fines': total_fines
            }
        except Exception as e:
            print(f"Error fetching violation stats: {e}")
            return {}
    
    def get_vehicle_stats(self) -> Dict:
        """Get vehicle statistics"""
        try:
            # Get total vehicles
            total_response = self.client.table('vehicles').select('*', count='exact').execute()
            total_vehicles = total_response.count or 0
            
            # Get vehicles by status
            active_response = self.client.table('vehicles').select('*', count='exact').eq('status', 'active').execute()
            active_count = active_response.count or 0
            
            expired_response = self.client.table('vehicles').select('*', count='exact').eq('status', 'expired').execute()
            expired_count = expired_response.count or 0
            
            suspended_response = self.client.table('vehicles').select('*', count='exact').eq('status', 'suspended').execute()
            suspended_count = suspended_response.count or 0
            
            return {
                'total_vehicles': total_vehicles,
                'active_vehicles': active_count,
                'expired_vehicles': expired_count,
                'suspended_vehicles': suspended_count
            }
        except Exception as e:
            print(f"Error fetching vehicle stats: {e}")
            return {}

# Initialize the client
supabase_client = SupabaseClient()
