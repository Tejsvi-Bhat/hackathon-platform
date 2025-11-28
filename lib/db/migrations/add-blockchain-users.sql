-- Migration: Add blockchain_users table for wallet-based authentication

-- Create blockchain_users table
-- This stores users who authenticate via wallet (no email/password)
CREATE TABLE IF NOT EXISTS blockchain_users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('organizer', 'participant', 'judge')),
    full_name VARCHAR(255),
    bio TEXT,
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    signature VARCHAR(132), -- Last authentication signature
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blockchain_users_wallet ON blockchain_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_users_role ON blockchain_users(role);

-- Add updated_at trigger
CREATE TRIGGER update_blockchain_users_updated_at BEFORE UPDATE ON blockchain_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE blockchain_users IS 'Users who authenticate via wallet signature (blockchain mode)';
COMMENT ON COLUMN blockchain_users.wallet_address IS 'Ethereum wallet address (lowercase)';
COMMENT ON COLUMN blockchain_users.role IS 'User role: organizer, participant, or judge';
COMMENT ON COLUMN blockchain_users.signature IS 'Last authentication signature for verification';
