-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'police', 'dvla', 'supervisor')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL,
  vehicle_type VARCHAR(100) NOT NULL,
  registration_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'expired', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Violations table
CREATE TABLE IF NOT EXISTS violations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL,
  violation_type VARCHAR(100) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  officer_id UUID REFERENCES users(id),
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'paid')) DEFAULT 'pending',
  fine_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending approvals table
CREATE TABLE IF NOT EXISTS pending_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  request_date DATE NOT NULL,
  account_type VARCHAR(20) CHECK (account_type IN ('police', 'dvla', 'supervisor')) NOT NULL,
  additional_info JSONB,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_violations_plate_number ON violations(plate_number);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_date_time ON violations(date_time);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_status ON pending_approvals(status);
CREATE INDEX IF NOT EXISTS idx_pending_approvals_account_type ON pending_approvals(account_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (email, username, role) VALUES
  ('admin@anpr.com', 'admin', 'admin'),
  ('police@anpr.com', 'police_officer', 'police'),
  ('dvla@anpr.com', 'dvla_officer', 'dvla'),
  ('supervisor@anpr.com', 'supervisor', 'supervisor')
ON CONFLICT (email) DO NOTHING;

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_approvals ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- All authenticated users can view vehicles
CREATE POLICY "Authenticated users can view vehicles" ON vehicles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Police and admin can insert/update violations
CREATE POLICY "Police and admin can manage violations" ON violations
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role IN ('police', 'admin')
    )
  );

-- All authenticated users can view violations
CREATE POLICY "Authenticated users can view violations" ON violations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin and supervisor can manage pending approvals
CREATE POLICY "Admin and supervisor can manage approvals" ON pending_approvals
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role IN ('admin', 'supervisor')
    )
  );

-- All authenticated users can view pending approvals
CREATE POLICY "Authenticated users can view approvals" ON pending_approvals
  FOR SELECT USING (auth.role() = 'authenticated');
