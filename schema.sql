-- =============================================================================
-- COMPREHENSIVE DATABASE SCHEMA FOR TRAFFIC MANAGEMENT SYSTEM
-- =============================================================================
-- This schema supports: Police, DVLA, Supervisor, and Admin modules
-- Database: PostgreSQL (Supabase)
-- Version: 2.0
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. USERS & AUTHENTICATION TABLES
-- =============================================================================

-- Main users table for authentication across all modules
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'police', 'dvla', 'supervisor')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
    
    -- Police-specific fields
    badge_number VARCHAR(50),
    rank VARCHAR(50),
    station VARCHAR(100),
    department VARCHAR(100),
    
    -- DVLA-specific fields
    employee_id VARCHAR(50),
    position VARCHAR(100),
    
    -- Audit fields
    last_login TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DVLA Users table (enhanced for DVLA module)
CREATE TABLE IF NOT EXISTS dvla_users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pending user approvals
CREATE TABLE IF NOT EXISTS pending_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('police', 'dvla', 'supervisor')),
    request_date DATE DEFAULT CURRENT_DATE,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('police', 'dvla', 'supervisor')),
    additional_info JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. VEHICLE MANAGEMENT TABLES
-- =============================================================================

-- Main vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL CHECK (vehicle_type IN ('private', 'commercial', 'motorcycle', 'truck', 'bus', 'trailer')),
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    color VARCHAR(30) NOT NULL,
    engine_number VARCHAR(50) NOT NULL,
    chassis_number VARCHAR(50) UNIQUE NOT NULL,
    vin VARCHAR(17),
    
    -- Owner information
    owner_name VARCHAR(100) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    owner_email VARCHAR(100),
    owner_address TEXT NOT NULL,
    owner_id_number VARCHAR(50),
    
    -- Registration information
    registration_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    insurance_expiry DATE,
    road_worthiness_expiry DATE,
    
    -- Status and tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'stolen', 'impounded')),
    registered_by UUID REFERENCES users(id),
    dvla_vehicle_id BIGINT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DVLA Vehicles table (detailed vehicle registry)
CREATE TABLE IF NOT EXISTS dvla_vehicles (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    vehicle_id UUID REFERENCES vehicles(id),
    reg_number VARCHAR(20) UNIQUE NOT NULL,
    manufacturer VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,
    chassis_number VARCHAR(50) UNIQUE NOT NULL,
    year_of_manufacture INTEGER NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    color VARCHAR(30) NOT NULL,
    use_type VARCHAR(20) NOT NULL CHECK (use_type IN ('Private', 'Commercial', 'Government', 'Diplomatic')),
    date_of_entry DATE NOT NULL,
    
    -- Technical specifications
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
    
    -- Engine specifications
    engine_make VARCHAR(50),
    engine_number VARCHAR(50),
    number_of_cylinders INTEGER,
    engine_cc INTEGER,
    horse_power INTEGER,
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG')),
    
    -- Owner information
    owner_name VARCHAR(100) NOT NULL,
    owner_address TEXT NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    owner_email VARCHAR(100) NOT NULL,
    owner_id_type VARCHAR(20) CHECK (owner_id_type IN ('Ghana Card', 'Passport', 'Drivers License')),
    owner_id_number VARCHAR(50),
    
    -- Status and tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'deregistered')),
    created_by BIGINT REFERENCES dvla_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. VIOLATIONS MANAGEMENT TABLES
-- =============================================================================

-- Traffic violations table
CREATE TABLE IF NOT EXISTS violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    violation_id VARCHAR(20) UNIQUE NOT NULL,
    plate_number VARCHAR(20) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    
    -- Violation details
    violation_type VARCHAR(50) NOT NULL CHECK (violation_type IN (
        'Speeding', 'Red Light', 'Illegal Parking', 'Drunk Driving', 
        'Overloading', 'No License', 'Expired License', 'No Insurance', 
        'Reckless Driving', 'Wrong Way', 'Mobile Phone Use', 'Seat Belt', 
        'Helmet Violation', 'Document Violation', 'Other'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('minor', 'major', 'critical')),
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    violation_details TEXT,
    
    -- Financial information
    fine_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'waived')),
    payment_date TIMESTAMPTZ,
    payment_method VARCHAR(30),
    payment_reference VARCHAR(100),
    
    -- Evidence and documentation
    evidence_image_urls TEXT[], -- Array of image URLs
    evidence_video_urls TEXT[], -- Array of video URLs
    officer_notes TEXT,
    additional_evidence JSONB,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'appealed', 'dismissed')),
    
    -- Personnel tracking
    reported_by UUID REFERENCES users(id) NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- Additional fields
    rejection_reason TEXT,
    appeal_reason TEXT,
    appeal_date TIMESTAMPTZ,
    court_date DATE,
    court_reference VARCHAR(100),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. DVLA SPECIFIC TABLES
-- =============================================================================

-- Vehicle renewals
CREATE TABLE IF NOT EXISTS dvla_renewals (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    vehicle_id BIGINT NOT NULL REFERENCES dvla_vehicles(id) ON DELETE CASCADE,
    renewal_type VARCHAR(30) NOT NULL CHECK (renewal_type IN ('Registration', 'Insurance', 'Road Worthiness')),
    renewal_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'expired')),
    
    -- Payment information
    amount_paid DECIMAL(10,2),
    payment_method VARCHAR(30),
    transaction_id VARCHAR(50),
    receipt_number VARCHAR(50),
    
    -- Documentation
    certificate_number VARCHAR(50),
    certificate_issued BOOLEAN DEFAULT FALSE,
    document_path VARCHAR(255),
    
    -- Processing information
    notes TEXT,
    processed_by BIGINT REFERENCES dvla_users(id),
    processed_at TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DVLA Fines table
CREATE TABLE IF NOT EXISTS dvla_fines (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    fine_id VARCHAR(20) UNIQUE NOT NULL,
    violation_id UUID REFERENCES violations(id),
    vehicle_id BIGINT NOT NULL REFERENCES dvla_vehicles(id),
    
    -- Offense details
    offense_description TEXT NOT NULL,
    offense_date TIMESTAMPTZ NOT NULL,
    offense_location TEXT NOT NULL,
    offense_code VARCHAR(10),
    
    -- Financial details
    amount DECIMAL(10,2) NOT NULL,
    penalty_points INTEGER DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'waived', 'written_off')),
    payment_method VARCHAR(30),
    payment_date TIMESTAMPTZ,
    payment_reference VARCHAR(100),
    
    -- Documentation
    payment_proof_path VARCHAR(255),
    marked_as_cleared BOOLEAN DEFAULT FALSE,
    clearance_date TIMESTAMPTZ,
    clearance_reason TEXT,
    
    -- Evidence
    evidence_paths TEXT,
    notes TEXT,
    
    -- Personnel tracking
    created_by BIGINT REFERENCES dvla_users(id),
    verified_by BIGINT REFERENCES dvla_users(id),
    cleared_by BIGINT REFERENCES dvla_users(id),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. SYSTEM ADMINISTRATION TABLES
-- =============================================================================

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    category VARCHAR(30) CHECK (category IN ('violation', 'renewal', 'payment', 'system', 'approval')),
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. REPORTING AND ANALYTICS TABLES
-- =============================================================================

-- Vehicle statistics snapshot
CREATE TABLE IF NOT EXISTS vehicle_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    total_vehicles INTEGER DEFAULT 0,
    active_vehicles INTEGER DEFAULT 0,
    expired_vehicles INTEGER DEFAULT 0,
    suspended_vehicles INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    renewals_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Violation statistics snapshot
CREATE TABLE IF NOT EXISTS violation_stats (
    id SERIAL PRIMARY KEY,
    stat_date DATE NOT NULL,
    total_violations INTEGER DEFAULT 0,
    pending_violations INTEGER DEFAULT 0,
    approved_violations INTEGER DEFAULT 0,
    rejected_violations INTEGER DEFAULT 0,
    paid_violations INTEGER DEFAULT 0,
    total_fines_amount DECIMAL(12,2) DEFAULT 0,
    collected_fines_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Vehicles table indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner_name ON vehicles(owner_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_expiry_date ON vehicles(expiry_date);

-- DVLA Vehicles table indexes
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_reg_number ON dvla_vehicles(reg_number);
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_license_plate ON dvla_vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_owner_name ON dvla_vehicles(owner_name);
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_chassis_number ON dvla_vehicles(chassis_number);
CREATE INDEX IF NOT EXISTS idx_dvla_vehicles_vin ON dvla_vehicles(vin);

-- Violations table indexes
CREATE INDEX IF NOT EXISTS idx_violations_plate_number ON violations(plate_number);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_reported_by ON violations(reported_by);
CREATE INDEX IF NOT EXISTS idx_violations_reported_at ON violations(reported_at);
CREATE INDEX IF NOT EXISTS idx_violations_violation_type ON violations(violation_type);

-- DVLA specific indexes
CREATE INDEX IF NOT EXISTS idx_dvla_renewals_vehicle_id ON dvla_renewals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_dvla_renewals_status ON dvla_renewals(status);
CREATE INDEX IF NOT EXISTS idx_dvla_renewals_expiry_date ON dvla_renewals(expiry_date);
CREATE INDEX IF NOT EXISTS idx_dvla_fines_vehicle_id ON dvla_fines(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_dvla_fines_payment_status ON dvla_fines(payment_status);
CREATE INDEX IF NOT EXISTS idx_dvla_fines_fine_id ON dvla_fines(fine_id);

-- System table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dvla_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dvla_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dvla_fines ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id::text);

-- Admins can view all data
CREATE POLICY "Admins can view all users" ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid() AND role = 'admin'
    )
);

-- Police can view violations they reported
CREATE POLICY "Police can view own violations" ON violations FOR SELECT USING (
    reported_by::text = auth.uid() OR
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid() AND role IN ('admin', 'supervisor')
    )
);

-- DVLA users can view DVLA data
CREATE POLICY "DVLA users can view DVLA data" ON dvla_vehicles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id::text = auth.uid() AND role IN ('admin', 'dvla')
    )
);

-- =============================================================================
-- 9. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_violations_updated_at BEFORE UPDATE ON violations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dvla_vehicles_updated_at BEFORE UPDATE ON dvla_vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dvla_renewals_updated_at BEFORE UPDATE ON dvla_renewals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dvla_fines_updated_at BEFORE UPDATE ON dvla_fines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 10. SAMPLE DATA (OPTIONAL)
-- =============================================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (id, username, email, password_hash, role, first_name, last_name, status) 
VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@anpr.gov.gh',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq',
    'admin',
    'System',
    'Administrator',
    'active'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('fine_penalty_rate', '1.5', 'number', 'Penalty multiplier for late fine payments', 'fines', FALSE),
('session_timeout_minutes', '30', 'number', 'User session timeout in minutes', 'security', FALSE),
('max_login_attempts', '5', 'number', 'Maximum failed login attempts before lockout', 'security', FALSE),
('system_name', 'Ghana Traffic Management System', 'string', 'Official system name', 'general', TRUE),
('maintenance_mode', 'false', 'boolean', 'System maintenance mode flag', 'system', FALSE)
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================================================
-- SCHEMA CREATION COMPLETE
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database schema created successfully! All tables, indexes, and policies are now in place.' as status;
