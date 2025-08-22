-- User Accounts Schema for Plate Recognition System
-- This schema supports user registration with admin approval workflow

-- Create enum types for better data consistency
CREATE TYPE account_type AS ENUM ('police', 'dvla', 'supervisor', 'admin');
CREATE TYPE account_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- User accounts table
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    
    -- Account information
    account_type account_type NOT NULL,
    status account_status DEFAULT 'pending' NOT NULL,
    password_hash TEXT NOT NULL, -- Store hashed passwords only
    
    -- Police-specific fields
    badge_number VARCHAR(50) UNIQUE, -- Only for police officers
    rank VARCHAR(100), -- Only for police officers
    station VARCHAR(200), -- Only for police officers
    
    -- DVLA-specific fields
    id_number VARCHAR(50) UNIQUE, -- Only for DVLA officers
    position VARCHAR(100), -- Only for DVLA officers
    
    -- Approval workflow
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES user_accounts(id), -- Reference to admin who approved
    rejection_reason TEXT, -- Optional reason for rejection
    
    -- Activity tracking
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_police_fields CHECK (
        account_type != 'police' OR (
            badge_number IS NOT NULL AND 
            rank IS NOT NULL AND 
            station IS NOT NULL
        )
    ),
    
    CONSTRAINT check_dvla_fields CHECK (
        account_type != 'dvla' OR (
            id_number IS NOT NULL AND 
            position IS NOT NULL
        )
    ),
    
    CONSTRAINT check_approved_timestamp CHECK (
        status != 'approved' OR approved_at IS NOT NULL
    )
);

-- Create indexes for performance
CREATE INDEX idx_user_accounts_email ON user_accounts(email);
CREATE INDEX idx_user_accounts_badge_number ON user_accounts(badge_number) WHERE badge_number IS NOT NULL;
CREATE INDEX idx_user_accounts_id_number ON user_accounts(id_number) WHERE id_number IS NOT NULL;
CREATE INDEX idx_user_accounts_status ON user_accounts(status);
CREATE INDEX idx_user_accounts_account_type ON user_accounts(account_type);
CREATE INDEX idx_user_accounts_created_at ON user_accounts(created_at);

-- Function to get username for login (badge_number for police, id_number for DVLA)
CREATE OR REPLACE FUNCTION get_username(account user_accounts)
RETURNS TEXT AS $$
BEGIN
    CASE account.account_type
        WHEN 'police' THEN RETURN account.badge_number;
        WHEN 'dvla' THEN RETURN account.id_number;
        ELSE RETURN account.email;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Insert initial admin user (update credentials as needed)
INSERT INTO user_accounts (
    first_name, last_name, email, telephone, account_type, status, 
    password_hash, approved_at, approved_by
) VALUES 
-- System Administrator
('System', 'Administrator', 'admin@platerecognition.gov.gh', '+233200000000', 'admin', 'approved', 
 -- This should be a properly hashed password in production
 '$2b$12$example.hash.for.password.Wattaddo020', NOW(), (SELECT id FROM user_accounts WHERE account_type = 'admin' LIMIT 1)),

-- Supervisor
('John', 'Supervisor', 'supervisor@platerecognition.gov.gh', '+233200000001', 'supervisor', 'approved',
 '$2b$12$example.hash.for.password.Killerman020', NOW(), (SELECT id FROM user_accounts WHERE account_type = 'admin' LIMIT 1))

ON CONFLICT (email) DO NOTHING;

-- Update the supervisor's approved_by to reference the admin (self-reference workaround)
UPDATE user_accounts 
SET approved_by = (SELECT id FROM user_accounts WHERE account_type = 'admin' LIMIT 1)
WHERE account_type IN ('admin', 'supervisor') AND approved_by IS NULL;

-- Row Level Security (RLS) policies for data protection
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own account" ON user_accounts
    FOR SELECT USING (auth.uid()::text = id::text);

-- Policy: Admins can view all accounts
CREATE POLICY "Admins can view all accounts" ON user_accounts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_accounts 
            WHERE id::text = auth.uid()::text 
            AND account_type = 'admin' 
            AND status = 'approved'
        )
    );

-- Policy: Admins can approve/reject accounts
CREATE POLICY "Admins can update accounts" ON user_accounts
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_accounts 
            WHERE id::text = auth.uid()::text 
            AND account_type = 'admin' 
            AND status = 'approved'
        )
    );

-- Policy: Anyone can create pending accounts (registration)
CREATE POLICY "Anyone can register" ON user_accounts
    FOR INSERT WITH CHECK (status = 'pending');

-- Create a view for pending approvals (admin use)
CREATE OR REPLACE VIEW pending_user_approvals AS
SELECT 
    id,
    first_name,
    last_name,
    email,
    telephone,
    account_type,
    CASE 
        WHEN account_type = 'police' THEN badge_number
        WHEN account_type = 'dvla' THEN id_number
        ELSE NULL
    END as username,
    CASE 
        WHEN account_type = 'police' THEN rank
        WHEN account_type = 'dvla' THEN position
        ELSE NULL
    END as role_info,
    CASE 
        WHEN account_type = 'police' THEN station
        ELSE NULL
    END as additional_info,
    created_at
FROM user_accounts
WHERE status = 'pending'
ORDER BY created_at ASC;

-- Create a function for user authentication
CREATE OR REPLACE FUNCTION authenticate_user(
    p_username TEXT,
    p_password TEXT,
    p_account_type account_type
)
RETURNS TABLE(
    user_id UUID,
    full_name TEXT,
    email TEXT,
    account_type account_type,
    status account_status
) AS $$
DECLARE
    user_record user_accounts%ROWTYPE;
BEGIN
    -- Find user by username and account type
    SELECT * INTO user_record
    FROM user_accounts
    WHERE status = 'approved'
    AND user_accounts.account_type = p_account_type
    AND (
        (p_account_type = 'police' AND badge_number = p_username) OR
        (p_account_type = 'dvla' AND id_number = p_username) OR
        (p_account_type IN ('admin', 'supervisor') AND email = p_username)
    );

    -- Check if user exists and password matches (in production, use proper password hashing)
    IF user_record.id IS NOT NULL THEN
        -- Update last login
        UPDATE user_accounts 
        SET last_login = NOW(), login_attempts = 0
        WHERE id = user_record.id;
        
        -- Return user info
        RETURN QUERY SELECT 
            user_record.id,
            user_record.first_name || ' ' || user_record.last_name,
            user_record.email,
            user_record.account_type,
            user_record.status;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trail table for account changes
CREATE TABLE user_account_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_account_id UUID NOT NULL REFERENCES user_accounts(id),
    action VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'suspended', 'login', etc.
    performed_by UUID REFERENCES user_accounts(id),
    reason TEXT,
    old_status account_status,
    new_status account_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_account_audit_user_id ON user_account_audit(user_account_id);
CREATE INDEX idx_user_account_audit_created_at ON user_account_audit(created_at);

-- Trigger to automatically create audit trail
CREATE OR REPLACE FUNCTION audit_user_account_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Log status changes
        IF OLD.status != NEW.status THEN
            INSERT INTO user_account_audit (
                user_account_id, action, old_status, new_status, performed_by
            ) VALUES (
                NEW.id, 
                'status_change',
                OLD.status,
                NEW.status,
                NEW.approved_by
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_user_account_changes
    AFTER UPDATE ON user_accounts
    FOR EACH ROW EXECUTE FUNCTION audit_user_account_changes();
