-- =====================================================
-- Create Admin User for KaziBORA
-- Email: careersasa90@gmail.com
-- =====================================================

-- First, you need to create the user account through Supabase Auth
-- This SQL will update the profile to admin role after signup

-- Option 1: If user doesn't exist yet, create via Supabase Dashboard
-- Go to: Authentication > Users > Invite user
-- Email: careersasa90@gmail.com
-- Then run the SQL below to make them admin

-- Option 2: If you're using Supabase CLI or have access to auth.users
-- Insert user directly (requires service role key):
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO user_id FROM auth.users WHERE email = 'careersasa90@gmail.com';
  
  IF user_id IS NULL THEN
    -- User doesn't exist - you'll need to create them first via:
    -- 1. Sign up through your app, OR
    -- 2. Use Supabase Dashboard: Authentication > Users > Add user
    RAISE NOTICE 'User does not exist. Please create the user first through:';
    RAISE NOTICE '  1. Your app signup page, OR';
    RAISE NOTICE '  2. Supabase Dashboard > Authentication > Users > Add user';
    RAISE NOTICE '  Email: careersasa90@gmail.com';
    RAISE NOTICE '  Password: CareerSasa12!';
    RAISE NOTICE 'After creating, run this script again to grant admin role.';
  ELSE
    -- User exists, update their role to admin
    UPDATE profiles 
    SET role = 'admin', 
        full_name = COALESCE(full_name, 'Admin User'),
        updated_at = NOW()
    WHERE id = user_id;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SUCCESS! User is now an ADMIN';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: careersasa90@gmail.com';
    RAISE NOTICE 'Role: admin';
    RAISE NOTICE 'You can now log in with full admin privileges!';
    RAISE NOTICE '========================================';
  END IF;
END $$;

