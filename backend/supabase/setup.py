#!/usr/bin/env python3
"""
Supabase Setup Script for ANPR Backend
This script helps set up and test the Supabase integration
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

from supabase.config import supabase_config, UserRoles, ViolationStatus, VehicleStatus, ApprovalStatus, AccountType
from supabase.client import supabase_client

def check_environment():
    """Check if required environment variables are set"""
    print("🔍 Checking environment variables...")
    
    required_vars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("\nPlease set the following environment variables:")
        for var in missing_vars:
            print(f"  {var}=your_value_here")
        return False
    
    print("✅ All required environment variables are set")
    return True

def validate_configuration():
    """Validate Supabase configuration"""
    print("\n🔧 Validating Supabase configuration...")
    
    try:
        if supabase_config.validate_config():
            print("✅ Configuration is valid")
            return True
        else:
            print("❌ Configuration validation failed")
            return False
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def test_connection():
    """Test connection to Supabase"""
    print("\n🔌 Testing Supabase connection...")
    
    try:
        # Try to fetch users to test connection
        users = supabase_client.get_users()
        print(f"✅ Connection successful! Found {len(users)} users")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def setup_sample_data():
    """Set up sample data in the database"""
    print("\n📝 Setting up sample data...")
    
    try:
        # Sample users
        sample_users = [
            {
                'email': 'admin@anpr.com',
                'username': 'admin',
                'role': UserRoles.ADMIN
            },
            {
                'email': 'police@anpr.com',
                'username': 'police_officer',
                'role': UserRoles.POLICE
            },
            {
                'email': 'dvla@anpr.com',
                'username': 'dvla_officer',
                'role': UserRoles.DVLA
            },
            {
                'email': 'supervisor@anpr.com',
                'username': 'supervisor',
                'role': UserRoles.SUPERVISOR
            }
        ]
        
        # Sample vehicles
        sample_vehicles = [
            {
                'plate_number': 'ABC123',
                'owner_name': 'John Doe',
                'owner_email': 'john.doe@example.com',
                'vehicle_type': 'Sedan',
                'registration_date': '2024-01-15',
                'expiry_date': '2025-01-15',
                'status': VehicleStatus.ACTIVE
            },
            {
                'plate_number': 'XYZ789',
                'owner_name': 'Jane Smith',
                'owner_email': 'jane.smith@example.com',
                'vehicle_type': 'SUV',
                'registration_date': '2023-06-20',
                'expiry_date': '2024-06-20',
                'status': VehicleStatus.EXPIRED
            }
        ]
        
        # Sample violations
        sample_violations = [
            {
                'plate_number': 'ABC123',
                'violation_type': 'Speeding',
                'description': 'Exceeded speed limit by 20 km/h',
                'location': 'Main Street, Downtown',
                'date_time': '2024-01-20T10:30:00Z',
                'officer_id': None,  # Will be set when we have actual user IDs
                'status': ViolationStatus.PENDING,
                'fine_amount': 150.00
            }
        ]
        
        # Sample pending approvals
        sample_approvals = [
            {
                'user_name': 'New Police Officer',
                'email': 'new.police@example.com',
                'role': 'Police Officer',
                'request_date': '2024-01-25',
                'account_type': AccountType.POLICE,
                'additional_info': {
                    'badge_number': 'P12345',
                    'rank': 'Constable',
                    'station': 'Central Station'
                },
                'status': ApprovalStatus.PENDING
            }
        ]
        
        # Insert sample data
        print("  📊 Inserting sample users...")
        for user in sample_users:
            supabase_client.create_user(user)
        
        print("  🚗 Inserting sample vehicles...")
        for vehicle in sample_vehicles:
            supabase_client.create_vehicle(vehicle)
        
        print("  ⚠️ Inserting sample violations...")
        for violation in sample_violations:
            supabase_client.create_violation(violation)
        
        print("  📋 Inserting sample approvals...")
        for approval in sample_approvals:
            supabase_client.create_approval_request(approval)
        
        print("✅ Sample data setup completed")
        return True
        
    except Exception as e:
        print(f"❌ Sample data setup failed: {e}")
        return False

def test_queries():
    """Test various database queries"""
    print("\n🔍 Testing database queries...")
    
    try:
        # Test user queries
        users = supabase_client.get_users()
        print(f"  👥 Users: {len(users)} found")
        
        # Test vehicle queries
        vehicles = supabase_client.get_vehicles()
        print(f"  🚗 Vehicles: {len(vehicles)} found")
        
        # Test violation queries
        violations = supabase_client.get_violations()
        print(f"  ⚠️ Violations: {len(violations)} found")
        
        # Test approval queries
        approvals = supabase_client.get_pending_approvals()
        print(f"  📋 Pending approvals: {len(approvals)} found")
        
        # Test statistics
        violation_stats = supabase_client.get_violation_stats()
        print(f"  📊 Violation stats: {violation_stats}")
        
        vehicle_stats = supabase_client.get_vehicle_stats()
        print(f"  📊 Vehicle stats: {vehicle_stats}")
        
        print("✅ All queries working correctly")
        return True
        
    except Exception as e:
        print(f"❌ Query testing failed: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 ANPR Supabase Backend Setup")
    print("=" * 40)
    
    # Step 1: Check environment
    if not check_environment():
        return False
    
    # Step 2: Validate configuration
    if not validate_configuration():
        return False
    
    # Step 3: Test connection
    if not test_connection():
        return False
    
    # Step 4: Setup sample data (optional)
    setup_sample = input("\n🤔 Would you like to set up sample data? (y/n): ").lower().strip()
    if setup_sample == 'y':
        if not setup_sample_data():
            return False
    
    # Step 5: Test queries
    if not test_queries():
        return False
    
    print("\n🎉 Supabase backend setup completed successfully!")
    print("\nNext steps:")
    print("1. Update your backend API endpoints to use the Supabase client")
    print("2. Test the integration with your frontend")
    print("3. Deploy your application")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
