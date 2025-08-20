import os
from typing import Optional

class SupabaseConfig:
    """Configuration class for Supabase backend integration"""
    
    def __init__(self):
        self.url: Optional[str] = os.getenv('SUPABASE_URL')
        self.anon_key: Optional[str] = os.getenv('SUPABASE_ANON_KEY')
        self.service_key: Optional[str] = os.getenv('SUPABASE_SERVICE_KEY')
        
        # Validate required environment variables
        if not self.url:
            raise ValueError("SUPABASE_URL environment variable is required")
        if not self.service_key:
            raise ValueError("SUPABASE_SERVICE_KEY environment variable is required")
    
    @property
    def is_configured(self) -> bool:
        """Check if Supabase is properly configured"""
        return bool(self.url and self.service_key)
    
    def get_connection_string(self) -> str:
        """Get database connection string for direct PostgreSQL access"""
        if not self.url:
            raise ValueError("SUPABASE_URL not configured")
        
        # Extract database connection details from Supabase URL
        # This is for advanced use cases where direct DB access is needed
        return f"postgresql://postgres:[password]@{self.url.replace('https://', '').replace('.supabase.co', '')}:5432/postgres"
    
    def validate_config(self) -> bool:
        """Validate the configuration"""
        try:
            if not self.url:
                print("❌ SUPABASE_URL is missing")
                return False
            
            if not self.service_key:
                print("❌ SUPABASE_SERVICE_KEY is missing")
                return False
            
            if not self.url.startswith('https://'):
                print("❌ SUPABASE_URL must start with https://")
                return False
            
            if not self.url.endswith('.supabase.co'):
                print("❌ SUPABASE_URL must end with .supabase.co")
                return False
            
            print("✅ Supabase configuration is valid")
            return True
            
        except Exception as e:
            print(f"❌ Configuration validation failed: {e}")
            return False

# Database table names
class Tables:
    """Database table names"""
    USERS = 'users'
    VEHICLES = 'vehicles'
    VIOLATIONS = 'violations'
    PENDING_APPROVALS = 'pending_approvals'

# User roles
class UserRoles:
    """User role constants"""
    ADMIN = 'admin'
    POLICE = 'police'
    DVLA = 'dvla'
    SUPERVISOR = 'supervisor'
    
    @classmethod
    def get_all_roles(cls) -> list:
        """Get all available roles"""
        return [cls.ADMIN, cls.POLICE, cls.DVLA, cls.SUPERVISOR]
    
    @classmethod
    def is_valid_role(cls, role: str) -> bool:
        """Check if a role is valid"""
        return role in cls.get_all_roles()

# Violation statuses
class ViolationStatus:
    """Violation status constants"""
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    PAID = 'paid'
    
    @classmethod
    def get_all_statuses(cls) -> list:
        """Get all available statuses"""
        return [cls.PENDING, cls.APPROVED, cls.REJECTED, cls.PAID]
    
    @classmethod
    def is_valid_status(cls, status: str) -> bool:
        """Check if a status is valid"""
        return status in cls.get_all_statuses()

# Vehicle statuses
class VehicleStatus:
    """Vehicle status constants"""
    ACTIVE = 'active'
    EXPIRED = 'expired'
    SUSPENDED = 'suspended'
    
    @classmethod
    def get_all_statuses(cls) -> list:
        """Get all available statuses"""
        return [cls.ACTIVE, cls.EXPIRED, cls.SUSPENDED]
    
    @classmethod
    def is_valid_status(cls, status: str) -> bool:
        """Check if a status is valid"""
        return status in cls.get_all_statuses()

# Approval statuses
class ApprovalStatus:
    """Approval status constants"""
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    
    @classmethod
    def get_all_statuses(cls) -> list:
        """Get all available statuses"""
        return [cls.PENDING, cls.APPROVED, cls.REJECTED]
    
    @classmethod
    def is_valid_status(cls, status: str) -> bool:
        """Check if a status is valid"""
        return status in cls.get_all_statuses()

# Account types for pending approvals
class AccountType:
    """Account type constants"""
    POLICE = 'police'
    DVLA = 'dvla'
    SUPERVISOR = 'supervisor'
    
    @classmethod
    def get_all_types(cls) -> list:
        """Get all available account types"""
        return [cls.POLICE, cls.DVLA, cls.SUPERVISOR]
    
    @classmethod
    def is_valid_type(cls, account_type: str) -> bool:
        """Check if an account type is valid"""
        return account_type in cls.get_all_types()

# Initialize configuration
supabase_config = SupabaseConfig()
