-- =====================================================
-- JOB SEEKER PROFILE ENHANCEMENT MIGRATION
-- =====================================================
-- This migration adds CV/resume fields to profiles table
-- for job seekers to store their documents

-- Add CV/resume fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS cover_letter_template TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.resume_url IS 'URL to job seeker''s stored resume/CV';
COMMENT ON COLUMN profiles.cover_letter_template IS 'Default cover letter template for job applications';
COMMENT ON COLUMN profiles.skills IS 'Array of skills for job matching';
COMMENT ON COLUMN profiles.experience_years IS 'Years of professional experience';
COMMENT ON COLUMN profiles.education IS 'Educational background';
COMMENT ON COLUMN profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN profiles.location IS 'Job seeker location';
COMMENT ON COLUMN profiles.bio IS 'Professional bio/summary';

-- Update RLS policies to allow job seekers to update their own profile fields
CREATE POLICY "Job seekers can update their own profile details"
  ON profiles FOR UPDATE 
  USING (
    id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'job_seeker'
    )
  );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ JOB SEEKER PROFILE ENHANCEMENT COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Added Fields:';
  RAISE NOTICE '   - resume_url (TEXT)';
  RAISE NOTICE '   - cover_letter_template (TEXT)';
  RAISE NOTICE '   - skills (TEXT[])';
  RAISE NOTICE '   - experience_years (INTEGER)';
  RAISE NOTICE '   - education (TEXT)';
  RAISE NOTICE '   - phone (TEXT)';
  RAISE NOTICE '   - location (TEXT)';
  RAISE NOTICE '   - bio (TEXT)';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security:';
  RAISE NOTICE '   - Job seekers can update their own profiles';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for enhanced job applications!';
  RAISE NOTICE '========================================';
END $$;
