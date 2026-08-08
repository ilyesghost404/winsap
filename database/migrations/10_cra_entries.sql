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
