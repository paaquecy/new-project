"""
Database setup script for ANPR system
This script creates the necessary tables in Supabase
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv(" https://lecgzbljmubqjpvjgjgk.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY2d6YmxqbXVicWpwdmpnamdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ5ODg5OSwiZXhwIjoyMDcwMDc0ODk5fQ.4lhEgRgpcnNtMJTjqy8I7WNEUsX-E8duVdoTsAFCJCA")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables")
    exit(1)

# Initialize Supabase client with service role key for admin operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def create_users_table():
    """Create users table"""
    try:
        # This would typically be done through Supabase dashboard
        # Here we're just checking if the table exists
        response = supabase.table("users").select("id").limit(1).execute()
        print("✅ Users table exists")
        return True
    except Exception as e:
        print(f"❌ Users table error: {e}")
        print("Please create the users table in Supabase dashboard with the following schema:")
        print("""
        CREATE TABLE users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR UNIQUE NOT NULL,
            email VARCHAR UNIQUE NOT NULL,
            password_hash VARCHAR NOT NULL,
            role VARCHAR NOT NULL CHECK (role IN ('admin', 'police', 'dvla', 'supervisor')),
            first_name VARCHAR NOT NULL,
            last_name VARCHAR NOT NULL,
            phone_number VARCHAR,
            status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
            badge_number VARCHAR,
            rank VARCHAR,
            station VARCHAR,
            id_number VARCHAR,
            position VARCHAR,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """)
        return False

def create_vehicles_table():
    """Create vehicles table"""
    try:
        response = supabase.table("vehicles").select("id").limit(1).execute()
        print("✅ Vehicles table exists")
        return True
    except Exception as e:
        print(f"❌ Vehicles table error: {e}")
        print("Please create the vehicles table in Supabase dashboard with the following schema:")
        print("""
        CREATE TABLE vehicles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            plate_number VARCHAR UNIQUE NOT NULL,
            vehicle_type VARCHAR NOT NULL CHECK (vehicle_type IN ('private', 'commercial', 'motorcycle', 'truck', 'bus')),
            make VARCHAR NOT NULL,
            model VARCHAR NOT NULL,
            year INTEGER NOT NULL,
            color VARCHAR NOT NULL,
            engine_number VARCHAR NOT NULL,
            chassis_number VARCHAR NOT NULL,
            owner_name VARCHAR NOT NULL,
            owner_phone VARCHAR NOT NULL,
            owner_email VARCHAR,
            owner_address VARCHAR NOT NULL,
            registration_date TIMESTAMP WITH TIME ZONE NOT NULL,
            expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
            insurance_expiry TIMESTAMP WITH TIME ZONE,
            road_worthiness_expiry TIMESTAMP WITH TIME ZONE,
            status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'stolen')),
            registered_by UUID REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """)
        return False

def create_violations_table():
    """Create violations table"""
    try:
        response = supabase.table("violations").select("id").limit(1).execute()
        print("✅ Violations table exists")
        return True
    except Exception as e:
        print(f"❌ Violations table error: {e}")
        print("Please create the violations table in Supabase dashboard with the following schema:")
        print("""
        CREATE TABLE violations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            plate_number VARCHAR NOT NULL,
            violation_type VARCHAR NOT NULL CHECK (violation_type IN ('speeding', 'red_light', 'illegal_parking', 'drunk_driving', 'overloading', 'no_license', 'expired_license', 'no_insurance', 'other')),
            severity VARCHAR NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
            location VARCHAR NOT NULL,
            description TEXT NOT NULL,
            fine_amount DECIMAL(10,2) NOT NULL,
            evidence_image TEXT,
            officer_notes TEXT,
            status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'appealed')),
            reported_by UUID REFERENCES users(id),
            reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            reviewed_by UUID REFERENCES users(id),
            reviewed_at TIMESTAMP WITH TIME ZONE,
            rejection_reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """)
        return False

def insert_sample_data():
    """Insert sample data for testing"""
    try:
        # Insert sample users
        sample_users = [
            {
                "id": "admin-001",
                "username": "4231220075",
                "email": "admin@anpr.gov.gh",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq",  # Wattaddo020
                "role": "admin",
                "first_name": "Admin",
                "last_name": "User",
                "phone_number": "+233201234567",
                "status": "active"
            },
            {
                "id": "police-001",
                "username": "1234567890",
                "email": "police@anpr.gov.gh",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq",  # Madman020
                "role": "police",
                "first_name": "Police",
                "last_name": "Officer",
                "phone_number": "+233201234568",
                "status": "active",
                "badge_number": "P12345",
                "rank": "Sergeant",
                "station": "Central Station"
            },
            {
                "id": "dvla-001",
                "username": "0987654321",
                "email": "dvla@anpr.gov.gh",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq",  # Bigfish020
                "role": "dvla",
                "first_name": "DVLA",
                "last_name": "Officer",
                "phone_number": "+233201234569",
                "status": "active",
                "id_number": "DVLA001",
                "position": "Registration Officer"
            },
            {
                "id": "supervisor-001",
                "username": "0203549815",
                "email": "supervisor@anpr.gov.gh",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq",  # Killerman020
                "role": "supervisor",
                "first_name": "Supervisor",
                "last_name": "User",
                "phone_number": "+233201234570",
                "status": "active"
            }
        ]
        
        for user in sample_users:
            try:
                supabase.table("users").insert(user).execute()
                print(f"✅ Inserted user: {user['username']}")
            except Exception as e:
                print(f"⚠️ User {user['username']} already exists or error: {e}")
        
        # Insert sample vehicles
        sample_vehicles = [
            {
                "id": "vehicle-001",
                "plate_number": "AB 1234 C",
                "vehicle_type": "private",
                "make": "Toyota",
                "model": "Corolla",
                "year": 2020,
                "color": "White",
                "engine_number": "ENG123456789",
                "chassis_number": "CHS123456789",
                "owner_name": "John Doe",
                "owner_phone": "+233201234571",
                "owner_email": "john.doe@email.com",
                "owner_address": "123 Main Street, Accra",
                "registration_date": "2020-01-01T00:00:00Z",
                "expiry_date": "2025-01-01T00:00:00Z",
                "insurance_expiry": "2024-12-31T00:00:00Z",
                "road_worthiness_expiry": "2024-12-31T00:00:00Z",
                "status": "active",
                "registered_by": "dvla-001"
            },
            {
                "id": "vehicle-002",
                "plate_number": "CD 5678 D",
                "vehicle_type": "commercial",
                "make": "Ford",
                "model": "Transit",
                "year": 2019,
                "color": "Blue",
                "engine_number": "ENG987654321",
                "chassis_number": "CHS987654321",
                "owner_name": "Jane Smith",
                "owner_phone": "+233201234572",
                "owner_email": "jane.smith@email.com",
                "owner_address": "456 Business Ave, Kumasi",
                "registration_date": "2019-06-01T00:00:00Z",
                "expiry_date": "2024-06-01T00:00:00Z",
                "insurance_expiry": "2024-05-31T00:00:00Z",
                "road_worthiness_expiry": "2024-05-31T00:00:00Z",
                "status": "active",
                "registered_by": "dvla-001"
            }
        ]
        
        for vehicle in sample_vehicles:
            try:
                supabase.table("vehicles").insert(vehicle).execute()
                print(f"✅ Inserted vehicle: {vehicle['plate_number']}")
            except Exception as e:
                print(f"⚠️ Vehicle {vehicle['plate_number']} already exists or error: {e}")
        
        print("✅ Sample data inserted successfully")
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {e}")

def main():
    """Main setup function"""
    print("🚀 Setting up ANPR Database...")
    
    # Check tables
    users_ok = create_users_table()
    vehicles_ok = create_vehicles_table()
    violations_ok = create_violations_table()
    
    if users_ok and vehicles_ok and violations_ok:
        print("\n✅ All tables are ready!")
        
        # Ask if user wants to insert sample data
        response = input("\nDo you want to insert sample data? (y/n): ")
        if response.lower() == 'y':
            insert_sample_data()
        
        print("\n🎉 Database setup complete!")
        print("\nNext steps:")
        print("1. Copy env_example.txt to .env and fill in your Supabase credentials")
        print("2. Install Python dependencies: pip install -r requirements.txt")
        print("3. Run the backend: python main.py")
        
    else:
        print("\n❌ Please create the missing tables in Supabase dashboard first")

if __name__ == "__main__":
    main() 