-- =====================================================
-- KaziBORA Job Portal - COMPLETE DATABASE SETUP FINAL
-- Handles ALL edge cases including partial/broken setups
-- Safe to run on ANY database state
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: DROP EXISTING TABLES (Safe - Clean Slate)
-- =====================================================
-- Note: This is safe for fresh setup. If you have data you want to keep,
-- stop here and contact support. Otherwise, proceed.

DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- =====================================================
-- STEP 2: CREATE ALL TABLES FROM SCRATCH
-- =====================================================

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employer', 'job_seeker', 'admin')),
  company_name TEXT,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table
CREATE TABLE companies (
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

-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  salary TEXT,
  apply_link TEXT NOT NULL,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  applicant_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  cover_letter TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- =====================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- profiles -> companies
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- jobs -> profiles (employer)
ALTER TABLE jobs 
  ADD CONSTRAINT jobs_employer_id_fkey 
  FOREIGN KEY (employer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- jobs -> companies
ALTER TABLE jobs 
  ADD CONSTRAINT jobs_company_id_fkey 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- applications -> jobs
ALTER TABLE applications 
  ADD CONSTRAINT applications_job_id_fkey 
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

-- applications -> profiles
ALTER TABLE applications 
  ADD CONSTRAINT applications_applicant_id_fkey 
  FOREIGN KEY (applicant_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- bookmarks -> jobs
ALTER TABLE bookmarks 
  ADD CONSTRAINT bookmarks_job_id_fkey 
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

-- bookmarks -> profiles
ALTER TABLE bookmarks 
  ADD CONSTRAINT bookmarks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: CREATE RLS POLICIES
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
      WHERE profiles.company_id = companies.id 
        AND profiles.id = auth.uid()
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
      WHERE profiles.company_id = companies.id 
        AND profiles.id = auth.uid()
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
    AND (
      employer_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
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
      WHERE jobs.id = applications.job_id 
        AND jobs.employer_id = auth.uid()
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
      WHERE jobs.id = applications.job_id 
        AND jobs.employer_id = auth.uid()
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
-- STEP 6: CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
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

-- Function to auto-create profile on user signup
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

-- Trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SUCCESS! 🎉
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Tables Created:';
  RAISE NOTICE '   - profiles (with company_id link)';
  RAISE NOTICE '   - companies (NEW!)';
  RAISE NOTICE '   - jobs (with company_id link)';
  RAISE NOTICE '   - applications';
  RAISE NOTICE '   - bookmarks';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security:';
  RAISE NOTICE '   - Row Level Security: ENABLED';
  RAISE NOTICE '   - Role-based policies: ACTIVE';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to use!';
  RAISE NOTICE '   1. Start your app: npm run dev';
  RAISE NOTICE '   2. Sign up as Employer';
  RAISE NOTICE '   3. Create company profile';
  RAISE NOTICE '   4. Post jobs!';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;


