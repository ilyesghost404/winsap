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
