-- Supabase Storage Setup for Blog Images
-- Run this in your Supabase SQL Editor

-- =====================================================
-- CREATE STORAGE BUCKET FOR BLOG IMAGES
-- =====================================================

-- Note: Storage buckets are created via Supabase Dashboard
-- Go to Storage → Create Bucket → Name: "blog-images" → Public: Yes

-- After creating the bucket, run these policies:

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Allow public read access to blog images
CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow authenticated users to upload blog images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  auth.role() = 'authenticated'
);

-- Allow admins to update blog images
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete blog images
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- HELPER FUNCTION TO GET PUBLIC URL
-- =====================================================

CREATE OR REPLACE FUNCTION get_blog_image_url(file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN format('https://%s.supabase.co/storage/v1/object/public/blog-images/%s',
    current_setting('app.settings.project_id', true),
    file_path
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

/*

STEP 1: CREATE STORAGE BUCKET
------------------------------
1. Go to Supabase Dashboard
2. Navigate to Storage section
3. Click "Create Bucket"
4. Bucket name: blog-images
5. Public bucket: YES (check this!)
6. File size limit: 5MB (or your preference)
7. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
8. Click "Create Bucket"

STEP 2: RUN THIS SQL
--------------------
After creating the bucket, run this SQL file in the SQL Editor.

STEP 3: TEST
------------
Try uploading an image from the blog post form!

NOTES:
------
- Images will be stored in: /blog-images/{user-id}/{filename}
- Public URLs will be: https://[project].supabase.co/storage/v1/object/public/blog-images/...
- Recommended max file size: 5MB
- Supported formats: JPG, PNG, WebP, GIF

*/

