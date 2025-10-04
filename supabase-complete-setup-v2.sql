-- =====================================================
-- KaziBORA Job Portal - COMPLETE DATABASE SETUP V2
-- This script is SAFE to run multiple times (idempotent)
-- Handles partial/broken previous setups
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: CREATE BASE TABLES
-- =====================================================

-- Create custom user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employer', 'job_seeker', 'admin')),
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  location TEXT,
  size TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table (basic structure first)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: ADD MISSING COLUMNS (Safe - checks first)
-- =====================================================

-- Add columns to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_id') THEN
    ALTER TABLE profiles ADD COLUMN company_id UUID;
  END IF;
END $$;

-- Add columns to jobs
DO $$ 
BEGIN
  -- Add employer_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'employer_id') THEN
    ALTER TABLE jobs ADD COLUMN employer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
  END IF;
  
  -- Add company (text field)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'company') THEN
    ALTER TABLE jobs ADD COLUMN company TEXT;
  END IF;
  
  -- Add salary
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'salary') THEN
    ALTER TABLE jobs ADD COLUMN salary TEXT;
  END IF;
  
  -- Add apply_link
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'apply_link') THEN
    ALTER TABLE jobs ADD COLUMN apply_link TEXT NOT NULL DEFAULT '';
  END IF;
  
  -- Add company_id (for linking to companies table)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'company_id') THEN
    ALTER TABLE jobs ADD COLUMN company_id UUID;
  END IF;
END $$;

-- Add columns to applications
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'job_id') THEN
    ALTER TABLE applications ADD COLUMN job_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'applicant_id') THEN
    ALTER TABLE applications ADD COLUMN applicant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'status') THEN
    ALTER TABLE applications ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'cover_letter') THEN
    ALTER TABLE applications ADD COLUMN cover_letter TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'resume_url') THEN
    ALTER TABLE applications ADD COLUMN resume_url TEXT;
  END IF;
END $$;

-- Add columns to bookmarks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'job_id') THEN
    ALTER TABLE bookmarks ADD COLUMN job_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'user_id') THEN
    ALTER TABLE bookmarks ADD COLUMN user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';
  END IF;
END $$;

-- =====================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS (Safe)
-- =====================================================

-- Drop existing constraints if they exist (to recreate them properly)
DO $$ 
BEGIN
  -- profiles.company_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_company_id_fkey') THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_company_id_fkey;
  END IF;
  
  -- jobs.employer_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'jobs_employer_id_fkey') THEN
    ALTER TABLE jobs DROP CONSTRAINT jobs_employer_id_fkey;
  END IF;
  
  -- jobs.company_id
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'jobs_company_id_fkey') THEN
    ALTER TABLE jobs DROP CONSTRAINT jobs_company_id_fkey;
  END IF;
  
  -- applications foreign keys
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'applications_job_id_fkey') THEN
    ALTER TABLE applications DROP CONSTRAINT applications_job_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'applications_applicant_id_fkey') THEN
    ALTER TABLE applications DROP CONSTRAINT applications_applicant_id_fkey;
  END IF;
  
  -- bookmarks foreign keys
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookmarks_job_id_fkey') THEN
    ALTER TABLE bookmarks DROP CONSTRAINT bookmarks_job_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookmarks_user_id_fkey') THEN
    ALTER TABLE bookmarks DROP CONSTRAINT bookmarks_user_id_fkey;
  END IF;
END $$;

-- Add foreign key constraints
ALTER TABLE profiles ADD CONSTRAINT profiles_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE jobs ADD CONSTRAINT jobs_employer_id_fkey 
  FOREIGN KEY (employer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE jobs ADD CONSTRAINT jobs_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

ALTER TABLE applications ADD CONSTRAINT applications_job_id_fkey 
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE applications ADD CONSTRAINT applications_applicant_id_fkey 
  FOREIGN KEY (applicant_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_job_id_fkey 
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 4: ADD UNIQUE CONSTRAINTS
-- =====================================================

-- Drop existing unique constraints
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'applications_job_id_applicant_id_key') THEN
    ALTER TABLE applications DROP CONSTRAINT applications_job_id_applicant_id_key;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookmarks_job_id_user_id_key') THEN
    ALTER TABLE bookmarks DROP CONSTRAINT bookmarks_job_id_user_id_key;
  END IF;
END $$;

-- Add unique constraints
ALTER TABLE applications ADD CONSTRAINT applications_job_id_applicant_id_key 
  UNIQUE(job_id, applicant_id);

ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_job_id_user_id_key 
  UNIQUE(job_id, user_id);

-- =====================================================
-- STEP 5: MAKE COMPANY FIELD NULLABLE
-- =====================================================

ALTER TABLE jobs ALTER COLUMN company DROP NOT NULL;

-- =====================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: DROP EXISTING POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
DROP POLICY IF EXISTS "Employers can create companies" ON companies;
DROP POLICY IF EXISTS "Employers can update their own company" ON companies;
DROP POLICY IF EXISTS "Employers can delete their own company" ON companies;

DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Employers and admins can create jobs" ON jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON jobs;

DROP POLICY IF EXISTS "Users can view relevant applications" ON applications;
DROP POLICY IF EXISTS "Job seekers can create applications" ON applications;
DROP POLICY IF EXISTS "Employers can update application status" ON applications;

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Job seekers can create bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- =====================================================
-- STEP 8: CREATE POLICIES
-- =====================================================

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- COMPANIES POLICIES
CREATE POLICY "Companies are viewable by everyone"
ON companies FOR SELECT USING (true);

CREATE POLICY "Employers can create companies"
ON companies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'employer')
);

CREATE POLICY "Employers can update their own company"
ON companies FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.company_id = companies.id AND profiles.id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Employers can delete their own company"
ON companies FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.company_id = companies.id AND profiles.id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- JOBS POLICIES
CREATE POLICY "Jobs are viewable by everyone"
ON jobs FOR SELECT USING (true);

CREATE POLICY "Employers and admins can create jobs"
ON jobs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (role = 'employer' OR role = 'admin')
  )
  AND (employer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "Employers can update their own jobs"
ON jobs FOR UPDATE USING (
  employer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Employers can delete their own jobs"
ON jobs FOR DELETE USING (
  employer_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- APPLICATIONS POLICIES
CREATE POLICY "Users can view relevant applications"
ON applications FOR SELECT USING (
  applicant_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Job seekers can create applications"
ON applications FOR INSERT WITH CHECK (
  applicant_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'job_seeker')
);

CREATE POLICY "Employers can update application status"
ON applications FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- BOOKMARKS POLICIES
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Job seekers can create bookmarks"
ON bookmarks FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'job_seeker')
);

CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- STEP 9: CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;

CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
BEFORE UPDATE ON companies FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
BEFORE UPDATE ON jobs FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 10: AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'job_seeker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMPLETE! 🎉
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ SUCCESS! Database setup complete with Company Profiles feature.';
  RAISE NOTICE '📝 Tables: profiles, companies, jobs, applications, bookmarks';
  RAISE NOTICE '🔒 Row Level Security: ENABLED';
  RAISE NOTICE '🚀 Ready to use! Start your app with: npm run dev';
END $$;


