#!/usr/bin/env python3
"""
Unified Database Schema Setup for ANPR System
Creates all necessary tables in Supabase for the unified backend
"""

import os
import asyncio
from dotenv import load_dotenv
from database.supabase_client import supabase

load_dotenv()

async def create_unified_schema():
    """Create all necessary tables for the unified system"""
    
    # DVLA Users table
    dvla_users_sql = """
    CREATE TABLE IF NOT EXISTS dvla_users (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    """
    
    # DVLA Vehicles table (enhanced)
    dvla_vehicles_sql = """
    CREATE TABLE IF NOT EXISTS dvla_vehicles (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        reg_number VARCHAR(20) UNIQUE NOT NULL,
        manufacturer VARCHAR(50) NOT NULL,
        model VARCHAR(50) NOT NULL,
        vehicle_type VARCHAR(30) NOT NULL,
        chassis_number VARCHAR(50) UNIQUE NOT NULL,
        year_of_manufacture INTEGER NOT NULL,
        vin VARCHAR(17) UNIQUE NOT NULL,
        license_plate VARCHAR(20) UNIQUE NOT NULL,
        color VARCHAR(30) NOT NULL,
        use_type VARCHAR(20) NOT NULL,
        date_of_entry DATE NOT NULL,
        length_cm INTEGER,
        width_cm INTEGER,
        height_cm INTEGER,
        number_of_axles INTEGER,
        number_of_wheels INTEGER,
        tyre_size_front VARCHAR(20),
        tyre_size_middle VARCHAR(20),
        tyre_size_rear VARCHAR(20),
        axle_load_front_kg INTEGER,
        axle_load_middle_kg INTEGER,
        axle_load_rear_kg INTEGER,
        weight_kg INTEGER,
        engine_make VARCHAR(50),
        engine_number VARCHAR(50),
        number_of_cylinders INTEGER,
        engine_cc INTEGER,
        horse_power INTEGER,
        owner_name VARCHAR(100) NOT NULL,
        owner_address TEXT NOT NULL,
        owner_phone VARCHAR(20) NOT NULL,
        owner_email VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_by BIGINT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (created_by) REFERENCES dvla_users(id)
    );
    """
    
    # DVLA Renewals table
    dvla_renewals_sql = """
    CREATE TABLE IF NOT EXISTS dvla_renewals (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        vehicle_id BIGINT NOT NULL,
        renewal_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        amount_paid DECIMAL(10,2),
        payment_method VARCHAR(30),
        transaction_id VARCHAR(50),
        notes TEXT,
        processed_by BIGINT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (vehicle_id) REFERENCES dvla_vehicles(id),
        FOREIGN KEY (processed_by) REFERENCES dvla_users(id)
    );
    """
    
    # DVLA Fines table
    dvla_fines_sql = """
    CREATE TABLE IF NOT EXISTS dvla_fines (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        fine_id VARCHAR(20) UNIQUE NOT NULL,
        vehicle_id BIGINT NOT NULL,
        offense_description TEXT NOT NULL,
        offense_date TIMESTAMPTZ NOT NULL,
        offense_location TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(20) DEFAULT 'unpaid',
        payment_method VARCHAR(30),
        payment_proof_path VARCHAR(255),
        marked_as_cleared BOOLEAN DEFAULT FALSE,
        notes TEXT,
        evidence_paths TEXT,
        created_by BIGINT,
        verified_by BIGINT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (vehicle_id) REFERENCES dvla_vehicles(id),
        FOREIGN KEY (created_by) REFERENCES dvla_users(id),
        FOREIGN KEY (verified_by) REFERENCES dvla_users(id)
    );
    """
    
    # Enhanced existing tables for better integration
    enhance_officers_sql = """
    ALTER TABLE officers 
    ADD COLUMN IF NOT EXISTS dvla_user_id BIGINT REFERENCES dvla_users(id);
    """
    
    enhance_vehicles_sql = """
    ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS dvla_vehicle_id BIGINT REFERENCES dvla_vehicles(id);
    """
    
    # Create indexes for performance
    indexes_sql = [
        "CREATE INDEX IF NOT EXISTS idx_dvla_users_username ON dvla_users(username);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_users_email ON dvla_users(email);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_reg_number ON dvla_vehicles(reg_number);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_license_plate ON dvla_vehicles(license_plate);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_owner_name ON dvla_vehicles(owner_name);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_renewals_vehicle_id ON dvla_renewals(vehicle_id);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_renewals_status ON dvla_renewals(status);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_fines_vehicle_id ON dvla_fines(vehicle_id);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_fines_payment_status ON dvla_fines(payment_status);",
        "CREATE INDEX IF NOT EXISTS idx_dvla_fines_fine_id ON dvla_fines(fine_id);",
        "CREATE INDEX IF NOT EXISTS idx_officers_dvla_user_id ON officers(dvla_user_id);",
        "CREATE INDEX IF NOT EXISTS idx_vehicles_dvla_vehicle_id ON vehicles(dvla_vehicle_id);"
    ]
    
    # Execute all SQL commands
    sql_commands = [
        ("DVLA Users", dvla_users_sql),
        ("DVLA Vehicles", dvla_vehicles_sql),
        ("DVLA Renewals", dvla_renewals_sql),
        ("DVLA Fines", dvla_fines_sql),
        ("Enhance Officers", enhance_officers_sql),
        ("Enhance Vehicles", enhance_vehicles_sql)
    ]
    
    try:
        print("🚀 Setting up unified database schema...")
        
        for name, sql in sql_commands:
            print(f"Creating {name} table...")
            result = supabase.rpc('exec_sql', {'sql': sql}).execute()
            if result.data:
                print(f"✅ {name} table created successfully")
            else:
                print(f"⚠️ {name} table creation may have had issues")
        
        print("Creating indexes...")
        for index_sql in indexes_sql:
            supabase.rpc('exec_sql', {'sql': index_sql}).execute()
        
        print("✅ All indexes created successfully")
        
        # Create sample data
        print("Creating sample DVLA admin user...")
        
        import bcrypt
        hashed_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        sample_user = {
            "username": "dvla_admin",
            "email": "admin@dvla.gov.uk",
            "password_hash": hashed_password,
            "full_name": "DVLA Administrator",
            "phone": "+44 300 790 6801",
            "role": "admin"
        }
        
        result = supabase.table("dvla_users").upsert(sample_user).execute()
        if result.data:
            print("✅ Sample DVLA admin user created")
        
        # Create sample vehicle
        print("Creating sample vehicle...")
        
        sample_vehicle = {
            "reg_number": "AB12 CDE",
            "manufacturer": "Toyota",
            "model": "Corolla",
            "vehicle_type": "Hatchback",
            "chassis_number": "JTDBL40E199000001",
            "year_of_manufacture": 2023,
            "vin": "JTDBL40E199000001",
            "license_plate": "AB12 CDE",
            "color": "Silver",
            "use_type": "Private",
            "date_of_entry": "2024-01-15",
            "owner_name": "John Smith",
            "owner_address": "123 High Street, London, UK",
            "owner_phone": "+44 7700 900123",
            "owner_email": "john.smith@example.com",
            "created_by": 1
        }
        
        result = supabase.table("dvla_vehicles").upsert(sample_vehicle).execute()
        if result.data:
            print("✅ Sample vehicle created")
        
        print("🎉 Unified database schema setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Error setting up database schema: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(create_unified_schema())
