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
