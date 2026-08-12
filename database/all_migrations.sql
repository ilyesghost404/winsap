-- ============================================================
-- CONSOLIDATED DATABASE MIGRATIONS (01 to 17)
-- Generated: 2026-08-12T10:51:57.711Z
-- ============================================================

-- ============================================================
-- Migration: 01_security_auth.sql
-- ============================================================

-- Migration 01: Security Auth Updates

-- 1. Modify users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_type VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Set existing users to verified so we don't lock everyone out immediately
UPDATE users SET is_verified = TRUE;

-- 2. Modify login_history
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS browser VARCHAR(100);
ALTER TABLE login_history ADD COLUMN IF NOT EXISTS device VARCHAR(100);

-- 3. Modify activity_logs
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS browser VARCHAR(100);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS device VARCHAR(100);

-- 4. Create new tables
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_jti VARCHAR(255) NOT NULL, -- Storing JWT ID (jti) for revoking
    ip_address VARCHAR(45),
    browser VARCHAR(100),
    device VARCHAR(100),
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Migration: 02_add_absence_source.sql
-- ============================================================

-- ==========================================
-- Migration: Add 'source' column to absences table
-- Distinguishes employee-submitted requests from automatic/system-generated absences
-- ==========================================

-- Step 1: Add the source column with default 'employee_request'
ALTER TABLE absences
ADD COLUMN IF NOT EXISTS source VARCHAR(30) DEFAULT 'employee_request' NOT NULL;

-- Step 2: Add CHECK constraint for valid source values
ALTER TABLE absences
ADD CONSTRAINT valid_absence_source
CHECK (source IN ('employee_request', 'automatic'));

-- Step 3: Backfill existing automatic records
-- The scheduler creates absences with reason 'Automatic absence - no check-in detected'
UPDATE absences
SET source = 'automatic'
WHERE reason ILIKE '%Automatic absence%';

-- Step 4: Create index for fast filtering by source
CREATE INDEX IF NOT EXISTS idx_absences_source ON absences(source);

-- ============================================================
-- Migration: 03_forgot_password.sql
-- ============================================================

-- ==========================================
-- Migration: Add Forgot Password OTP fields to users table
-- ==========================================

-- Add columns for storing reset code, its expiry timestamp, and verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_code_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_verified BOOLEAN DEFAULT FALSE;

-- ============================================================
-- Migration: 04_attendance_face_qr.sql
-- ============================================================

-- ==========================================
-- Migration 04: AI Face Recognition & Dynamic QR Code Verification
-- ==========================================

-- 1. Create table face_profiles
CREATE TABLE IF NOT EXISTS face_profiles (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    face_embedding JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create table qr_sessions
CREATE TABLE IF NOT EXISTS qr_sessions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER DEFAULT 1,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Update attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS qr_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS face_confidence DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS qr_session_id INTEGER REFERENCES qr_sessions(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS device_information TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS verification_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Create indices for faster searches
CREATE INDEX IF NOT EXISTS idx_face_profiles_employee ON face_profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_token ON qr_sessions(token);

-- ============================================================
-- Migration: 05_face_identity_mgmt.sql
-- ============================================================

-- ==========================================
-- Migration 05: Face Identity Management Lifecycle & Audit Logs
-- ==========================================

-- 1. Drop existing face_profiles if they exist to start with a clean slate
DROP TABLE IF EXISTS face_profiles CASCADE;

-- 2. Create face_profiles table
CREATE TABLE face_profiles (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    face_embeddings JSONB NOT NULL,
    face_quality_score DOUBLE PRECISION,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled'))
);

-- 3. Create face_security_logs table
CREATE TABLE face_security_logs (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- REGISTER, VERIFY, UPDATE
    result VARCHAR(50) NOT NULL, -- SUCCESS, FAILED
    confidence DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create indexes for performance optimization
CREATE INDEX idx_face_profiles_employee_id ON face_profiles(employee_id);
CREATE INDEX idx_face_security_logs_employee_id ON face_security_logs(employee_id);

-- ============================================================
-- Migration: 06_leave_balances.sql
-- ============================================================

-- Drop the old unused table
DROP TABLE IF EXISTS public.employee_leave_balance CASCADE;

-- Create leave_balances table
CREATE TABLE public.leave_balances (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL UNIQUE,
    paid_leave_balance NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    sick_leave_balance NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    last_accrual_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_balances_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
    CONSTRAINT chk_paid_balance_nonnegative CHECK (paid_leave_balance >= 0),
    CONSTRAINT chk_sick_balance_nonnegative CHECK (sick_leave_balance >= 0)
);

-- Create leave_transactions table
CREATE TABLE public.leave_transactions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    leave_type VARCHAR(20) NOT NULL, -- 'paid' or 'sick'
    amount NUMERIC(5,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- 'ACCRUAL', 'DEDUCTION', 'REFUND', 'ADJUSTMENT'
    reference_id INTEGER, -- e.g. absences.id
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_transactions_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
    CONSTRAINT chk_leave_type CHECK (leave_type IN ('paid', 'sick')),
    CONSTRAINT chk_transaction_type CHECK (transaction_type IN ('ACCRUAL', 'DEDUCTION', 'REFUND', 'ADJUSTMENT'))
);

-- Create index for performance
CREATE INDEX idx_leave_balances_employee ON public.leave_balances(employee_id);
CREATE INDEX idx_leave_transactions_employee ON public.leave_transactions(employee_id);

-- Create updated_at trigger
CREATE TRIGGER update_leave_balances_updated_at 
    BEFORE UPDATE ON public.leave_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pre-populate balances for existing employees
INSERT INTO public.leave_balances (employee_id, paid_leave_balance, sick_leave_balance, last_accrual_date)
SELECT id, 0.00, 5.00, CURRENT_DATE FROM public.employees
ON CONFLICT (employee_id) DO NOTHING;

-- ============================================================
-- Migration: 07_remote_work.sql
-- ============================================================

-- Create remote_work_requests table
CREATE TABLE public.remote_work_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'PENDING'::character varying NOT NULL,
    manager_id INTEGER,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_remote_work_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_remote_work_manager FOREIGN KEY (manager_id) REFERENCES public.employees(id) ON DELETE SET NULL,
    CONSTRAINT valid_remote_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_remote_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Create index for performance
CREATE INDEX idx_remote_work_employee ON public.remote_work_requests(employee_id);
CREATE INDEX idx_remote_work_status ON public.remote_work_requests(status);

-- Create trigger for updated_at
CREATE TRIGGER update_remote_work_requests_updated_at 
    BEFORE UPDATE ON public.remote_work_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Migration: 08_telework_leave_type.sql
-- ============================================================

-- Drop constraint and recreate to include 'Telework'
ALTER TABLE public.absences DROP CONSTRAINT IF EXISTS valid_absence_type;
ALTER TABLE public.absences ADD CONSTRAINT valid_absence_type CHECK (type IN ('Vacation', 'Sick Leave', 'Training', 'Other', 'Telework'));

-- ============================================================
-- Migration: 09_cleanup_remotework.sql
-- ============================================================

-- Drop remote_work_requests table
DROP TABLE IF EXISTS public.remote_work_requests CASCADE;

-- ============================================================
-- Migration: 10_cra_entries.sql
-- ============================================================

-- CRA (Compte Rendu d'Activité) entries table
-- Migration #10: Activity tracking for employees and managers

CREATE TABLE IF NOT EXISTS cra_entries (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    ticket_reference VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    duration_type VARCHAR(10) NOT NULL,
    duration_value NUMERIC(6,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_cra_duration_type CHECK (duration_type IN ('HOURS', 'DAYS')),
    CONSTRAINT valid_cra_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    CONSTRAINT valid_cra_dates CHECK (end_date >= start_date),
    CONSTRAINT valid_cra_duration CHECK (duration_value > 0)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cra_employee ON cra_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_cra_status ON cra_entries(status);
CREATE INDEX IF NOT EXISTS idx_cra_dates ON cra_entries(start_date, end_date);

-- Auto-update updated_at on row modification
CREATE TRIGGER update_cra_entries_updated_at
    BEFORE UPDATE ON cra_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Migration: 11_cra_timer_update.sql
-- ============================================================

-- Update CRA (Compte Rendu d'Activité) entries table structure
-- Migration #11: Timer-based automatic duration tracking

DROP TABLE IF EXISTS cra_entries CASCADE;

CREATE TABLE cra_entries (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    ticket_reference VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    status VARCHAR(30) DEFAULT 'PENDING_START',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_cra_status CHECK (status IN ('PENDING_START', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED')),
    CONSTRAINT valid_cra_times CHECK (end_time >= start_time),
    CONSTRAINT valid_cra_duration CHECK (duration_minutes >= 0)
);

-- Indexes for timer lookups and state queries
CREATE INDEX idx_cra_employee ON cra_entries(employee_id);
CREATE INDEX idx_cra_status ON cra_entries(status);

-- Auto-update updated_at trigger
CREATE TRIGGER update_cra_entries_updated_at
    BEFORE UPDATE ON cra_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Migration: 12_cra_pending_approval_priority.sql
-- ============================================================

-- Update CRA entries table for Pending Approval status & task ordering
-- Migration #12: Support PENDING_APPROVAL and priority ordering for pending tasks

-- Drop existing status constraint
ALTER TABLE cra_entries DROP CONSTRAINT IF EXISTS valid_cra_status;

-- Add updated status constraint including PENDING_APPROVAL
ALTER TABLE cra_entries 
  ADD CONSTRAINT valid_cra_status 
  CHECK (status IN ('PENDING_START', 'IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED', 'APPROVED', 'REJECTED'));

-- Add priority column for task ordering (default 0)
ALTER TABLE cra_entries 
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0 NOT NULL;

-- Migrate any existing COMPLETED records to PENDING_APPROVAL
UPDATE cra_entries SET status = 'PENDING_APPROVAL' WHERE status = 'COMPLETED';

-- Index for fast lookup of an employee's next pending task
CREATE INDEX IF NOT EXISTS idx_cra_employee_pending 
  ON cra_entries(employee_id, status, priority DESC, created_at ASC);

-- ============================================================
-- Migration: 13_email_tasks.sql
-- ============================================================

-- Email-to-CRA task tracking table
-- Migration #13: AI-powered email task import system

-- Table to track all processed emails and prevent duplicates
CREATE TABLE IF NOT EXISTS email_tasks (
    id SERIAL PRIMARY KEY,
    email_message_id VARCHAR(500) UNIQUE NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    subject TEXT NOT NULL,
    email_body TEXT,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    cra_entry_id INTEGER REFERENCES cra_entries(id) ON DELETE SET NULL,
    extracted_data JSONB,
    processing_status VARCHAR(30) DEFAULT 'PENDING',
    rejection_reason TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_email_task_status CHECK (
        processing_status IN ('PENDING', 'PROCESSED', 'FAILED', 'REJECTED')
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_tasks_message_id ON email_tasks(email_message_id);
CREATE INDEX IF NOT EXISTS idx_email_tasks_status ON email_tasks(processing_status);
CREATE INDEX IF NOT EXISTS idx_email_tasks_employee ON email_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_email_tasks_created ON email_tasks(created_at DESC);

-- Add source column to cra_entries to distinguish manual vs email-imported tasks
ALTER TABLE cra_entries ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

-- ============================================================
-- Migration: 14_employees_email_address.sql
-- ============================================================

-- Add email_address column to employees table if not exists
-- Migration #14: Support per-employee email inbox reading

ALTER TABLE employees ADD COLUMN IF NOT EXISTS email_address VARCHAR(150);

-- Sync email_address with existing email column where email_address is null
UPDATE employees SET email_address = email WHERE email_address IS NULL;

-- Ensure an index on email_address for efficient mailbox employee matching
CREATE INDEX IF NOT EXISTS idx_employees_email_address ON employees(email_address);

-- ============================================================
-- Migration: 15_remove_email_tasks.sql
-- ============================================================

-- Drop email_tasks table to clean up email-related components
-- Migration #15: Remove email task automation components

DROP TABLE IF EXISTS email_tasks CASCADE;

-- ============================================================
-- Migration: 16_cra_end_time_index.sql
-- ============================================================

-- Add index on end_time for yearly CRA reporting
-- Migration #16: Performance optimization for yearly activity reports

CREATE INDEX IF NOT EXISTS idx_cra_entries_end_time ON cra_entries(end_time);

-- ============================================================
-- Migration: 17_account_activation_flow.sql
-- ============================================================

-- Migration 17: Account Activation Flow Columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS activation_token_expiry TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

