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
