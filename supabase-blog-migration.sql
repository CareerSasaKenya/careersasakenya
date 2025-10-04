-- KaziBORA Blog Feature Migration
-- Run this SQL in your Supabase SQL Editor to add blog functionality

-- =====================================================
-- CREATE BLOG_POSTS TABLE
-- =====================================================

CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  featured_image TEXT,
  content TEXT NOT NULL,
  excerpt TEXT, -- Short description for listing page
  category TEXT,
  tags TEXT[], -- Array of tags
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  meta_description TEXT, -- For SEO
  meta_keywords TEXT[], -- For SEO
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Create index on status for filtering published posts
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

-- Create index on category for filtering
CREATE INDEX idx_blog_posts_category ON blog_posts(category);

-- Create GIN index on tags for array queries
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- =====================================================
-- ROW LEVEL SECURITY FOR BLOG_POSTS
-- =====================================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can view published blog posts
CREATE POLICY "Published blog posts are viewable by everyone"
ON blog_posts FOR SELECT
USING (status = 'published');

-- Admins can view all blog posts (including drafts)
CREATE POLICY "Admins can view all blog posts"
ON blog_posts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can create blog posts
CREATE POLICY "Admins can create blog posts"
ON blog_posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update any blog post
CREATE POLICY "Admins can update blog posts"
ON blog_posts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete blog posts
CREATE POLICY "Admins can delete blog posts"
ON blog_posts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- FUNCTION TO AUTO-UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
BEFORE UPDATE ON blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_blog_post_updated_at();

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample blog posts (you can remove this section if not needed)
INSERT INTO blog_posts (title, slug, featured_image, content, excerpt, category, tags, status, meta_description, published_at)
VALUES 
  (
    '10 Tips for Acing Your Next Job Interview',
    '10-tips-for-acing-your-next-job-interview',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
    '# 10 Tips for Acing Your Next Job Interview

Job interviews can be nerve-wracking, but with the right preparation, you can walk into any interview with confidence. Here are 10 essential tips to help you ace your next job interview:

## 1. Research the Company

Before your interview, spend time learning about the company''s mission, values, culture, and recent news. This shows genuine interest and helps you tailor your responses.

## 2. Practice Common Interview Questions

Prepare answers for common questions like "Tell me about yourself" and "Why do you want to work here?" Practice out loud to build confidence.

## 3. Dress Appropriately

First impressions matter. Dress professionally and appropriately for the company culture. When in doubt, err on the side of being more formal.

## 4. Arrive Early

Plan to arrive 10-15 minutes early. This shows punctuality and gives you time to compose yourself before the interview.

## 5. Bring Multiple Copies of Your Resume

Always bring at least 3-4 printed copies of your resume, even if you''ve already submitted it electronically.

## 6. Prepare Questions to Ask

Have thoughtful questions ready about the role, team, and company. This demonstrates your interest and engagement.

## 7. Use the STAR Method

When answering behavioral questions, use the STAR method (Situation, Task, Action, Result) to structure your responses clearly.

## 8. Show Enthusiasm

Let your passion for the role shine through. Employers want to hire people who are genuinely excited about the opportunity.

## 9. Be Honest

Don''t exaggerate your experience or skills. It''s better to be honest about areas where you''re still learning.

## 10. Follow Up

Send a thank-you email within 24 hours of your interview. This reinforces your interest and keeps you top of mind.

Remember, interviews are a two-way street. While the company is evaluating you, you should also be assessing whether the role and company are a good fit for your career goals.

Good luck with your next interview!',
    'Master your next job interview with these 10 essential tips that will help you stand out from other candidates and land your dream job.',
    'Career Advice',
    ARRAY['interview tips', 'career advice', 'job search'],
    'published',
    'Learn the top 10 tips for acing your job interview and landing your dream job. Expert advice on preparation, presentation, and follow-up.',
    NOW()
  ),
  (
    'The Future of Remote Work in 2025',
    'the-future-of-remote-work-in-2025',
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800',
    '# The Future of Remote Work in 2025

The landscape of work has fundamentally changed over the past few years. As we look ahead to 2025, remote work is no longer a temporary solution but a permanent fixture in the professional world.

## The Remote Work Revolution

What started as a necessity during the pandemic has evolved into a preferred working model for millions of professionals worldwide. Companies have realized that remote work doesn''t just work—it can lead to increased productivity, better work-life balance, and access to a global talent pool.

## Key Trends Shaping Remote Work

### 1. Hybrid Models Become Standard

Most companies are adopting hybrid models, allowing employees to split their time between home and office. This flexibility has become a key factor in attracting and retaining talent.

### 2. Digital Nomad Visas

More countries are offering digital nomad visas, making it easier for remote workers to live and work from anywhere in the world.

### 3. Advanced Collaboration Tools

Technology continues to evolve, with AI-powered tools making virtual collaboration more seamless and effective than ever before.

### 4. Focus on Work-Life Integration

Companies are moving beyond work-life balance to work-life integration, recognizing that flexibility leads to happier, more productive employees.

## Challenges to Address

While remote work offers many benefits, it also presents challenges:

- **Communication gaps**: Without face-to-face interaction, misunderstandings can occur more easily
- **Isolation**: Some employees struggle with the lack of social interaction
- **Time zone differences**: Global teams must navigate scheduling challenges
- **Home office setup**: Not everyone has an ideal working environment at home

## Preparing for the Future

To thrive in the remote work era, both employers and employees need to adapt:

**For Employers:**
- Invest in robust digital infrastructure
- Develop clear remote work policies
- Foster virtual team culture
- Provide home office stipends
- Focus on outcomes rather than hours worked

**For Employees:**
- Create a dedicated workspace
- Establish clear boundaries between work and personal life
- Over-communicate with team members
- Stay proactive about professional development
- Build a strong online professional presence

## Conclusion

Remote work is here to stay. By embracing this shift and addressing its challenges head-on, we can create a more flexible, inclusive, and productive future of work.

The question is no longer whether remote work will continue, but how we can make it work better for everyone involved.',
    'Explore the key trends and predictions shaping the future of remote work in 2025, from hybrid models to digital nomad lifestyles.',
    'Industry Trends',
    ARRAY['remote work', 'future of work', 'hybrid work', 'work from home'],
    'published',
    'Discover the future of remote work in 2025. Learn about hybrid models, digital nomad visas, and how to thrive in the new world of work.',
    NOW()
  );


