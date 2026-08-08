-- Drop email_tasks table to clean up email-related components
-- Migration #15: Remove email task automation components

DROP TABLE IF EXISTS email_tasks CASCADE;
