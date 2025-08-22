-- DVLA Database Schema for Supabase
-- This schema creates all the necessary tables for DVLA operations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create DVLA Users table
CREATE TABLE IF NOT EXISTS dvla_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'officer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DVLA Vehicles table
CREATE TABLE IF NOT EXISTS dvla_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    created_by UUID REFERENCES dvla_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DVLA Renewals table
CREATE TABLE IF NOT EXISTS dvla_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES dvla_vehicles(id) ON DELETE CASCADE,
    renewal_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    amount_paid DECIMAL(10,2),
    payment_method VARCHAR(30),
    transaction_id VARCHAR(50),
    notes TEXT,
    processed_by UUID REFERENCES dvla_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DVLA Fines table
CREATE TABLE IF NOT EXISTS dvla_fines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fine_id VARCHAR(20) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES dvla_vehicles(id) ON DELETE CASCADE,
    offense_description TEXT NOT NULL,
    offense_date TIMESTAMP WITH TIME ZONE NOT NULL,
    offense_location TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'overdue')),
    payment_method VARCHAR(30),
    payment_proof_url VARCHAR(500),
    marked_as_cleared BOOLEAN DEFAULT FALSE,
    notes TEXT,
    evidence_urls JSONB,
    created_by UUID REFERENCES dvla_users(id),
    verified_by UUID REFERENCES dvla_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DVLA Documents table
CREATE TABLE IF NOT EXISTS dvla_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('vehicle', 'fine', 'renewal', 'user')),
    entity_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    bucket_name VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES dvla_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DVLA Audit Logs table
CREATE TABLE IF NOT EXISTS dvla_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES dvla_users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dvla_users_email ON dvla_users(email);
CREATE INDEX IF NOT EXISTS idx_dvla_users_username ON dvla_users(username);
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_reg_number ON dvla_vehicles(reg_number);
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_license_plate ON dvla_vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_owner_email ON dvla_vehicles(owner_email);
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_status ON dvla_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_dvla_renewals_vehicle_id ON dvla_renewals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_dvla_renewals_status ON dvla_renewals(status);
CREATE INDEX IF NOT EXISTS idx_dvla_fines_vehicle_id ON dvla_fines(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_dvla_fines_fine_id ON dvla_fines(fine_id);
CREATE INDEX IF NOT EXISTS idx_dvla_fines_payment_status ON dvla_fines(payment_status);
CREATE INDEX IF NOT EXISTS idx_dvla_documents_entity ON dvla_documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_dvla_audit_logs_table_record ON dvla_audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_dvla_audit_logs_timestamp ON dvla_audit_logs(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to tables
CREATE TRIGGER update_dvla_users_updated_at 
    BEFORE UPDATE ON dvla_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dvla_vehicles_updated_at 
    BEFORE UPDATE ON dvla_vehicles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dvla_renewals_updated_at 
    BEFORE UPDATE ON dvla_renewals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dvla_fines_updated_at 
    BEFORE UPDATE ON dvla_fines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE dvla_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dvla_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dvla_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dvla_fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE dvla_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dvla_audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
-- Allow service key to access all data
CREATE POLICY "Service key access" ON dvla_users FOR ALL USING (true);
CREATE POLICY "Service key access" ON dvla_vehicles FOR ALL USING (true);
CREATE POLICY "Service key access" ON dvla_renewals FOR ALL USING (true);
CREATE POLICY "Service key access" ON dvla_fines FOR ALL USING (true);
CREATE POLICY "Service key access" ON dvla_documents FOR ALL USING (true);
CREATE POLICY "Service key access" ON dvla_audit_logs FOR ALL USING (true);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('dvla-documents', 'dvla-documents', false),
    ('dvla-evidence', 'dvla-evidence', false),
    ('dvla-payment-proofs', 'dvla-payment-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "DVLA documents access"
ON storage.objects FOR ALL 
USING (bucket_id = 'dvla-documents');

CREATE POLICY "DVLA evidence access"
ON storage.objects FOR ALL 
USING (bucket_id = 'dvla-evidence');

CREATE POLICY "DVLA payment proofs access"
ON storage.objects FOR ALL 
USING (bucket_id = 'dvla-payment-proofs');

-- Insert default admin user
INSERT INTO dvla_users (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@dvla.gov.uk',
    crypt('admin123', gen_salt('bf')),
    'System Administrator',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample vehicle data
INSERT INTO dvla_vehicles (
    reg_number, manufacturer, model, vehicle_type, chassis_number,
    year_of_manufacture, vin, license_plate, color, use_type,
    date_of_entry, owner_name, owner_address, owner_phone, owner_email,
    created_by
) VALUES 
(
    'GS-1657-20',
    'Toyota',
    'Camry',
    'sedan',
    'JHMNC5K1KJ1234567',
    2020,
    '1AZBCBUSB3M123BH0',
    'AS-4235-24',
    'Blue',
    'private',
    '2023-01-15',
    'Ayam Idumba',
    '123 Main St, Accra',
    '+44 7700 900123',
    'jane.doe@example.com',
    (SELECT id FROM dvla_users WHERE username = 'admin' LIMIT 1)
),
(
    'XYZ789',
    'Honda',
    'Civic',
    'sedan',
    'JHMNC5K1KJ7890123',
    2019,
    '1AZBCBUSB3M789BH0',
    'ER-2435-23',
    'Red',
    'private',
    '2023-02-20',
    'Yaw Asare',
    '456 Oak Ave, Manchester',
    '+44 7700 900456',
    'robert.smith@example.com',
    (SELECT id FROM dvla_users WHERE username = 'admin' LIMIT 1)
)
ON CONFLICT (reg_number) DO NOTHING;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_vehicle_with_owner(plate_number TEXT)
RETURNS TABLE (
    id UUID,
    reg_number VARCHAR,
    manufacturer VARCHAR,
    model VARCHAR,
    year_of_manufacture INTEGER,
    owner_name VARCHAR,
    owner_email VARCHAR,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.reg_number,
        v.manufacturer,
        v.model,
        v.year_of_manufacture,
        v.owner_name,
        v.owner_email,
        v.status
    FROM dvla_vehicles v
    WHERE v.license_plate = plate_number OR v.reg_number = plate_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_vehicle_statistics()
RETURNS TABLE (
    total_vehicles BIGINT,
    active_vehicles BIGINT,
    expired_vehicles BIGINT,
    suspended_vehicles BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_vehicles,
        COUNT(*) FILTER (WHERE status = 'active') as active_vehicles,
        COUNT(*) FILTER (WHERE status = 'expired') as expired_vehicles,
        COUNT(*) FILTER (WHERE status = 'suspended') as suspended_vehicles
    FROM dvla_vehicles;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE dvla_users IS 'DVLA system users with roles and authentication';
COMMENT ON TABLE dvla_vehicles IS 'Vehicle registration data with owner information and technical specifications';
COMMENT ON TABLE dvla_renewals IS 'Vehicle registration renewal records and payment tracking';
COMMENT ON TABLE dvla_fines IS 'Traffic fines and violations with payment status';
COMMENT ON TABLE dvla_documents IS 'File attachments and documents linked to various entities';
COMMENT ON TABLE dvla_audit_logs IS 'Audit trail for all database changes';
