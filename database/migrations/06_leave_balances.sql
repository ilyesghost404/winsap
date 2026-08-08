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
