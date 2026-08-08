-- Drop constraint and recreate to include 'Telework'
ALTER TABLE public.absences DROP CONSTRAINT IF EXISTS valid_absence_type;
ALTER TABLE public.absences ADD CONSTRAINT valid_absence_type CHECK (type IN ('Vacation', 'Sick Leave', 'Training', 'Other', 'Telework'));
