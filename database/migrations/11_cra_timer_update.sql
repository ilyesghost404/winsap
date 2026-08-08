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
