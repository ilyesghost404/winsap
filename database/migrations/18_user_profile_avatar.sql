-- Migration 18: Add profile picture / avatar_url support to users and employees
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
