-- KaziBORA Company Profiles Migration
-- Run this SQL in your Supabase SQL Editor to add company profile functionality

-- =====================================================
-- CREATE COMPANIES TABLE
-- =====================================================

CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  location TEXT,
  size TEXT, -- e.g., "1-10", "11-50", "51-200", "201-500", "500+"
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- UPDATE PROFILES TABLE
-- =====================================================

-- Add company_id to profiles (for Employer users)
ALTER TABLE profiles 
ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- =====================================================
-- UPDATE JOBS TABLE
-- =====================================================

-- Add company_id to jobs (optional - allows Admin flexibility)
ALTER TABLE jobs 
ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Make company field optional (for backward compatibility and admin posts without company)
ALTER TABLE jobs 
ALTER COLUMN company DROP NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY FOR COMPANIES
-- =====================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Everyone can view companies
CREATE POLICY "Companies are viewable by everyone"
ON companies FOR SELECT
USING (true);

-- Employers can create companies (only for themselves)
CREATE POLICY "Employers can create companies"
ON companies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'employer'
  )
);

-- Employers can update their own company, admins can update any company
CREATE POLICY "Employers can update their own company"
ON companies FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.company_id = companies.id AND profiles.id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Employers can delete their own company, admins can delete any company
CREATE POLICY "Employers can delete their own company"
ON companies FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.company_id = companies.id AND profiles.id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for updated_at on companies
CREATE TRIGGER update_companies_updated_at 
BEFORE UPDATE ON companies 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES
-- =====================================================

-- After running this migration:
-- 1. Existing jobs will have company_id = NULL (backward compatible)
-- 2. Employer users should create their company profile
-- 3. When employers create new jobs, they'll be automatically linked to their company
-- 4. Admin users can post jobs with or without a company_id
-- 5. If a job has no company_id, the UI will show "Posted by Admin" or similar


