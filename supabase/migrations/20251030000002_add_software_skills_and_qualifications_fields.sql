-- Add software_skills and qualifications fields back to jobs table as TEXT columns for rich text content
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS software_skills TEXT,
ADD COLUMN IF NOT EXISTS qualifications TEXT;