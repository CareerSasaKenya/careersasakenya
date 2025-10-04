-- =====================================================
-- KaziBORA Job Portal - COMPLETE DATABASE SETUP
-- This script is SAFE to run multiple times (idempotent)
-- =====================================================
-- Run this ONCE in your Supabase SQL Editor
-- It includes all base tables + company profiles feature
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: CREATE BASE TABLES
-- =====================================================

-- Create custom user profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employer', 'job_seeker', 'admin')),
  company_name TEXT, -- Only for employers (legacy field)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table (NEW - Company Profiles Feature)
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

-- Add company_id to profiles (links Employers to their company)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create jobs table with employer reference
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company TEXT, -- Made nullable for flexibility
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  salary TEXT,
  apply_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add company_id to jobs (links jobs to companies - optional for admin flexibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Make company field nullable if it isn't already
DO $$ 
BEGIN
  ALTER TABLE jobs ALTER COLUMN company DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN NULL; -- Ignore if already nullable
END $$;

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, applicant_id) -- One application per job per user
);

-- Create bookmarks/saved jobs table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id) -- One bookmark per job per user
);

-- =====================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: DROP EXISTING POLICIES (Safe - IF EXISTS)
-- =====================================================

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Companies policies
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON companies;
DROP POLICY IF EXISTS "Employers can create companies" ON companies;
DROP POLICY IF EXISTS "Employers can update their own company" ON companies;
DROP POLICY IF EXISTS "Employers can delete their own company" ON companies;

-- Jobs policies
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Employers and admins can create jobs" ON jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON jobs;

-- Applications policies
DROP POLICY IF EXISTS "Users can view relevant applications" ON applications;
DROP POLICY IF EXISTS "Job seekers can create applications" ON applications;
DROP POLICY IF EXISTS "Employers can update application status" ON applications;

-- Bookmarks policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Job seekers can create bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- =====================================================
-- STEP 4: CREATE POLICIES
-- =====================================================

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can create their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- COMPANIES POLICIES
CREATE POLICY "Companies are viewable by everyone"
ON companies FOR SELECT
USING (true);

CREATE POLICY "Employers can create companies"
ON companies FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'employer'
  )
);

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

-- JOBS POLICIES
CREATE POLICY "Jobs are viewable by everyone"
ON jobs FOR SELECT
USING (true);

CREATE POLICY "Employers and admins can create jobs"
ON jobs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() 
    AND (role = 'employer' OR role = 'admin')
  )
  AND (employer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ))
);

CREATE POLICY "Employers can update their own jobs"
ON jobs FOR UPDATE
USING (
  employer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Employers can delete their own jobs"
ON jobs FOR DELETE
USING (
  employer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- APPLICATIONS POLICIES
CREATE POLICY "Users can view relevant applications"
ON applications FOR SELECT
USING (
  applicant_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Job seekers can create applications"
ON applications FOR INSERT
WITH CHECK (
  applicant_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'job_seeker'
  )
);

CREATE POLICY "Employers can update application status"
ON applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM jobs
    WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- BOOKMARKS POLICIES
CREATE POLICY "Users can view their own bookmarks"
ON bookmarks FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Job seekers can create bookmarks"
ON bookmarks FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'job_seeker'
  )
);

CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- STEP 5: CREATE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers (safe)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
BEFORE UPDATE ON companies 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
BEFORE UPDATE ON jobs 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: AUTO-CREATE PROFILE ON USER SIGNUP
-- =====================================================

-- Create or replace the function
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

-- Drop existing trigger (safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when a user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMPLETE! 🎉
-- =====================================================
-- Your database is now fully set up with:
-- ✅ User profiles (job_seeker, employer, admin)
-- ✅ Company profiles (NEW!)
-- ✅ Jobs with company linking (NEW!)
-- ✅ Applications system
-- ✅ Bookmarks/saved jobs
-- ✅ Row Level Security
-- ✅ Auto-profile creation
--
-- Next steps:
-- 1. Start your application: npm run dev
-- 2. Sign up as an Employer
-- 3. Create your company profile
-- 4. Post jobs!
-- =====================================================

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ SUCCESS! Database setup complete with Company Profiles feature.';
  RAISE NOTICE '📝 You can now start your application and begin using all features.';
END $$;


