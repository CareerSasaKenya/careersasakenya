-- KaziBORA Blog Comments System
-- Run this SQL in your Supabase SQL Editor to add comments functionality

-- =====================================================
-- CREATE COMMENTS TABLE
-- =====================================================

CREATE TABLE blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent_id ON blog_comments(parent_id);
CREATE INDEX idx_blog_comments_status ON blog_comments(status);
CREATE INDEX idx_blog_comments_created_at ON blog_comments(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY FOR COMMENTS
-- =====================================================

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved comments
CREATE POLICY "Approved comments are viewable by everyone"
ON blog_comments FOR SELECT
USING (status = 'approved');

-- Users can view their own comments (even if pending/rejected)
CREATE POLICY "Users can view their own comments"
ON blog_comments FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all comments
CREATE POLICY "Admins can view all comments"
ON blog_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON blog_comments FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  user_id = auth.uid()
);

-- Users can update their own comments (within 15 minutes)
CREATE POLICY "Users can update their own recent comments"
ON blog_comments FOR UPDATE
USING (
  user_id = auth.uid() AND
  created_at > NOW() - INTERVAL '15 minutes'
)
WITH CHECK (
  user_id = auth.uid()
);

-- Admins can update any comment
CREATE POLICY "Admins can update any comment"
ON blog_comments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON blog_comments FOR DELETE
USING (user_id = auth.uid());

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
ON blog_comments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- FUNCTION TO AUTO-UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_blog_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_comments_updated_at
BEFORE UPDATE ON blog_comments
FOR EACH ROW
EXECUTE FUNCTION update_blog_comment_updated_at();

-- =====================================================
-- FUNCTION TO GET COMMENT COUNT FOR A POST
-- =====================================================

CREATE OR REPLACE FUNCTION get_comment_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM blog_comments
    WHERE post_id = post_uuid AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADD COMMENT COUNT TO BLOG_POSTS VIEW (OPTIONAL)
-- =====================================================

-- Create a view that includes comment counts
CREATE OR REPLACE VIEW blog_posts_with_stats AS
SELECT 
  bp.*,
  get_comment_count(bp.id) as comment_count
FROM blog_posts bp;

-- =====================================================
-- SAMPLE COMMENT (OPTIONAL)
-- =====================================================

-- Uncomment to add a sample comment (replace UUIDs with actual values from your database)
/*
INSERT INTO blog_comments (post_id, user_id, content, status)
VALUES (
  '[post-uuid-here]',
  '[user-uuid-here]',
  'Great article! This really helped me understand career growth strategies better.',
  'approved'
);
*/

-- =====================================================
-- NOTES
-- =====================================================

/*

FEATURES:
---------
1. Nested comments (replies to comments)
2. Comment moderation (pending/approved/rejected)
3. Users can edit comments within 15 minutes
4. Soft delete protection (deleting post deletes comments)
5. Admin moderation powers
6. Comment counts available via function

USAGE:
------
- Create comments: Users submit comments (auto-approved by default)
- Reply to comments: Set parent_id to reply to another comment
- Moderate: Admins can change status to 'rejected' or 'pending'
- Edit: Users can edit within 15 minutes, admins anytime
- Delete: Users can delete their own, admins can delete any

AUTO-APPROVAL:
-------------
Comments are auto-approved by default (status = 'approved')
To require moderation, change default to 'pending':

ALTER TABLE blog_comments 
ALTER COLUMN status SET DEFAULT 'pending';

*/

