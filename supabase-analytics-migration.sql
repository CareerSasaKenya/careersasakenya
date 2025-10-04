-- KaziBORA Blog Analytics System
-- Run this SQL in your Supabase SQL Editor to add analytics tracking

-- =====================================================
-- CREATE ANALYTICS TABLE
-- =====================================================

CREATE TABLE blog_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'like', 'share', 'click')),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for anonymous users
  session_id TEXT, -- For tracking unique sessions
  referrer TEXT, -- Where the visitor came from
  user_agent TEXT, -- Browser/device info
  ip_address TEXT, -- For unique visitor tracking (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_blog_analytics_post_id ON blog_analytics(post_id);
CREATE INDEX idx_blog_analytics_event_type ON blog_analytics(event_type);
CREATE INDEX idx_blog_analytics_created_at ON blog_analytics(created_at DESC);
CREATE INDEX idx_blog_analytics_session_id ON blog_analytics(session_id);

-- =====================================================
-- ROW LEVEL SECURITY FOR ANALYTICS
-- =====================================================

ALTER TABLE blog_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (including anonymous users)
CREATE POLICY "Anyone can track analytics events"
ON blog_analytics FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view all analytics"
ON blog_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- AGGREGATE VIEWS FOR ANALYTICS
-- =====================================================

-- View for post statistics
CREATE OR REPLACE VIEW blog_post_stats AS
SELECT 
  post_id,
  COUNT(DISTINCT CASE WHEN event_type = 'view' THEN session_id END) as unique_views,
  COUNT(CASE WHEN event_type = 'view' THEN 1 END) as total_views,
  COUNT(CASE WHEN event_type = 'like' THEN 1 END) as total_likes,
  COUNT(CASE WHEN event_type = 'share' THEN 1 END) as total_shares,
  COUNT(CASE WHEN event_type = 'click' THEN 1 END) as total_clicks
FROM blog_analytics
GROUP BY post_id;

-- View for daily analytics
CREATE OR REPLACE VIEW blog_daily_stats AS
SELECT 
  post_id,
  DATE(created_at) as date,
  COUNT(DISTINCT CASE WHEN event_type = 'view' THEN session_id END) as unique_views,
  COUNT(CASE WHEN event_type = 'view' THEN 1 END) as total_views
FROM blog_analytics
GROUP BY post_id, DATE(created_at)
ORDER BY date DESC;

-- =====================================================
-- FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to track a page view
CREATE OR REPLACE FUNCTION track_post_view(
  p_post_id UUID,
  p_session_id TEXT,
  p_user_id UUID DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO blog_analytics (
    post_id,
    event_type,
    user_id,
    session_id,
    referrer,
    user_agent
  ) VALUES (
    p_post_id,
    'view',
    p_user_id,
    p_session_id,
    p_referrer,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get post statistics
CREATE OR REPLACE FUNCTION get_post_stats(p_post_id UUID)
RETURNS TABLE(
  unique_views BIGINT,
  total_views BIGINT,
  total_likes BIGINT,
  total_shares BIGINT,
  total_clicks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT CASE WHEN event_type = 'view' THEN session_id END)::BIGINT as unique_views,
    COUNT(CASE WHEN event_type = 'view' THEN 1 END)::BIGINT as total_views,
    COUNT(CASE WHEN event_type = 'like' THEN 1 END)::BIGINT as total_likes,
    COUNT(CASE WHEN event_type = 'share' THEN 1 END)::BIGINT as total_shares,
    COUNT(CASE WHEN event_type = 'click' THEN 1 END)::BIGINT as total_clicks
  FROM blog_analytics
  WHERE post_id = p_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending posts (last 7 days)
CREATE OR REPLACE FUNCTION get_trending_posts(days_back INTEGER DEFAULT 7, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  post_id UUID,
  title TEXT,
  slug TEXT,
  view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id as post_id,
    bp.title,
    bp.slug,
    COUNT(ba.id)::BIGINT as view_count
  FROM blog_posts bp
  LEFT JOIN blog_analytics ba ON bp.id = ba.post_id
  WHERE 
    bp.status = 'published' AND
    ba.event_type = 'view' AND
    ba.created_at > NOW() - (days_back || ' days')::INTERVAL
  GROUP BY bp.id, bp.title, bp.slug
  ORDER BY view_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENHANCED BLOG POSTS VIEW WITH ANALYTICS
-- =====================================================

CREATE OR REPLACE VIEW blog_posts_with_analytics AS
SELECT 
  bp.*,
  COALESCE(stats.unique_views, 0) as unique_views,
  COALESCE(stats.total_views, 0) as total_views,
  COALESCE(stats.total_likes, 0) as total_likes,
  COALESCE(stats.total_shares, 0) as total_shares,
  COALESCE(get_comment_count(bp.id), 0) as comment_count
FROM blog_posts bp
LEFT JOIN blog_post_stats stats ON bp.id = stats.post_id;

-- =====================================================
-- PERIODIC CLEANUP (OPTIONAL)
-- =====================================================

-- Function to clean old analytics data (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS VOID AS $$
BEGIN
  DELETE FROM blog_analytics
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- You can schedule this to run periodically via cron or manually

-- =====================================================
-- NOTES
-- =====================================================

/*

FEATURES:
---------
1. Track views, likes, shares, and clicks
2. Unique visitor tracking via session_id
3. Anonymous user support
4. Referrer tracking
5. Aggregate views for quick stats
6. Trending posts function
7. Daily statistics
8. Privacy-friendly (can exclude IP addresses)

USAGE:
------
1. Track a view:
   SELECT track_post_view('[post-uuid]', '[session-id]', '[user-uuid]', '[referrer]', '[user-agent]');

2. Get post stats:
   SELECT * FROM get_post_stats('[post-uuid]');

3. Get trending posts:
   SELECT * FROM get_trending_posts(7, 10); -- Last 7 days, top 10

4. View all stats:
   SELECT * FROM blog_posts_with_analytics;

SESSION ID:
-----------
Generate a unique session ID in your frontend (localStorage):
- First visit: Generate and store UUID
- Return visits: Use stored UUID
- This tracks unique visitors

PRIVACY:
--------
- IP addresses are optional (can be NULL)
- Anonymous users supported (user_id can be NULL)
- GDPR-compliant with proper consent
- Old data can be cleaned up automatically

*/

