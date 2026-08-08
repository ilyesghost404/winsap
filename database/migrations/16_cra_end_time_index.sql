-- Add index on end_time for yearly CRA reporting
-- Migration #16: Performance optimization for yearly activity reports

CREATE INDEX IF NOT EXISTS idx_cra_entries_end_time ON cra_entries(end_time);
