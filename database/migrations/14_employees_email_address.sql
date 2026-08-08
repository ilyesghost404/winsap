-- Add email_address column to employees table if not exists
-- Migration #14: Support per-employee email inbox reading

ALTER TABLE employees ADD COLUMN IF NOT EXISTS email_address VARCHAR(150);

-- Sync email_address with existing email column where email_address is null
UPDATE employees SET email_address = email WHERE email_address IS NULL;

-- Ensure an index on email_address for efficient mailbox employee matching
CREATE INDEX IF NOT EXISTS idx_employees_email_address ON employees(email_address);
