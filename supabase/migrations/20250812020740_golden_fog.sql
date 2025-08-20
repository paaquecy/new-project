/*
  # Initial Database Schema for VPR System

  1. New Tables
    - `officers` - Police officers and system users
    - `vehicles` - Vehicle registration data
    - `violations` - Traffic violations
    - `scans` - Plate scan records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user roles

  3. Indexes
    - Performance indexes on frequently queried columns
    - Unique constraints for data integrity
*/

-- Create officers table
CREATE TABLE IF NOT EXISTS officers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  badge_number text UNIQUE NOT NULL,
  rank text DEFAULT 'Officer',
  department text DEFAULT 'Police Department',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text UNIQUE NOT NULL,
  vin text UNIQUE NOT NULL,
  make text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  color text DEFAULT 'Unknown',
  owner_name text NOT NULL,
  owner_address text,
  registration_status text DEFAULT 'Active',
  registration_expiry date,
  insurance_status text DEFAULT 'Valid',
  insurance_expiry date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create violations table
CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id),
  officer_id uuid REFERENCES officers(id),
  violation_type text NOT NULL,
  violation_details text,
  location text,
  status text DEFAULT 'Pending',
  evidence_urls text[] DEFAULT '{}',
  fine_amount numeric(10,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id uuid REFERENCES officers(id),
  plate_number text NOT NULL,
  scan_type text DEFAULT 'Manual',
  scan_result jsonb DEFAULT '{}',
  location text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_violations_plate_number ON violations(plate_number);
CREATE INDEX IF NOT EXISTS idx_violations_officer_id ON violations(officer_id);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_scans_officer_id ON scans(officer_id);
CREATE INDEX IF NOT EXISTS idx_scans_plate_number ON scans(plate_number);

-- Enable Row Level Security
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for officers
CREATE POLICY "Officers can read own data"
  ON officers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Officers can update own data"
  ON officers
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Create RLS policies for vehicles
CREATE POLICY "Officers can read all vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Officers can insert vehicles"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Officers can update vehicles"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create RLS policies for violations
CREATE POLICY "Officers can read all violations"
  ON violations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Officers can insert violations"
  ON violations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Officers can update violations"
  ON violations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create RLS policies for scans
CREATE POLICY "Officers can read own scans"
  ON scans
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = officer_id::text);

CREATE POLICY "Officers can insert own scans"
  ON scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = officer_id::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_officers_updated_at
  BEFORE UPDATE ON officers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_violations_updated_at
  BEFORE UPDATE ON violations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO officers (id, email, full_name, badge_number, rank, department) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'officer.doe@police.gov.gh', 'Officer John Doe', 'P001234', 'Sergeant', 'Traffic Division'),
  ('550e8400-e29b-41d4-a716-446655440001', 'officer.smith@police.gov.gh', 'Officer Jane Smith', 'P001235', 'Officer', 'Patrol Division')
ON CONFLICT (email) DO NOTHING;

INSERT INTO vehicles (plate_number, vin, make, model, year, color, owner_name, owner_address, registration_status, insurance_status) VALUES
  ('GH-1234-20', '1HGBH41JXMN109186', 'Toyota', 'Corolla', 2019, 'White', 'Kwame Asante', '123 Main St, Accra', 'Active', 'Valid'),
  ('AS-5678-21', '2HGBH41JXMN109187', 'Honda', 'Civic', 2020, 'Blue', 'Ama Serwaa', '456 Oak Ave, Kumasi', 'Active', 'Valid'),
  ('BA-9876-19', '3HGBH41JXMN109188', 'Nissan', 'Sentra', 2018, 'Red', 'Kofi Mensah', '789 Pine St, Tamale', 'Expired', 'Expired')
ON CONFLICT (plate_number) DO NOTHING;

INSERT INTO violations (plate_number, officer_id, violation_type, violation_details, location, status, fine_amount) VALUES
  ('GH-1234-20', '550e8400-e29b-41d4-a716-446655440000', 'Speeding', 'Vehicle exceeding speed limit by 20km/h', 'Accra-Tema Motorway', 'Pending', 150.00),
  ('AS-5678-21', '550e8400-e29b-41d4-a716-446655440001', 'Illegal Parking', 'Parked in no-parking zone', 'Osu, Accra', 'Approved', 50.00)
ON CONFLICT DO NOTHING;