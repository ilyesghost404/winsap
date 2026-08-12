-- Migration 17: Account Activation Flow Columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;
