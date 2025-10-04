import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { calculateReadingTime, formatReadingTime } from '../utils/readingTime'
import { usePostView, trackEvent } from '../hooks/useAnalytics'
import SocialShare from '../components/SocialShare'
import Comments from '../components/Comments'
import './BlogPostPage.css'

function BlogPostPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [author, setAuthor] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [readingTime, setReadingTime] = useState(0)

  // Track page view
  usePostView(post?.id, user)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) throw error

      setPost(data)

      // Calculate reading time
      const minutes = calculateReadingTime(data.content)
      setReadingTime(minutes)

      // Fetch author
      if (data.author_id) {
        fetchAuthor(data.author_id)
      }

      // Fetch related posts
      fetchRelatedPosts(data)
    } catch (err) {
      console.error('Error fetching blog post:', err)
      setError('Failed to load blog post. It may not exist or has been removed.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthor = async (authorId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', authorId)
        .single()

      if (error) throw error
      setAuthor(data)
    } catch (err) {
      console.error('Error fetching author:', err)
    }
  }

  const fetchRelatedPosts = async (currentPost) => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('id, title, slug, featured_image, excerpt, category, published_at, created_at')
        .eq('status', 'published')
        .neq('id', currentPost.id)
        .limit(3)

      // Try to get posts from the same category first
      if (currentPost.category) {
        query = query.eq('category', currentPost.category)
      }

      query = query.order('published_at', { ascending: false, nullsFirst: false })
      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setRelatedPosts(data || [])
    } catch (err) {
      console.error('Error fetching related posts:', err)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = (platform) => {
    // Track share event
    if (post?.id) {
      trackEvent(post.id, 'share', user)
    }
  }

  const formatContent = (content) => {
    // Simple markdown-like formatting
    // Convert line breaks to paragraphs
    const paragraphs = content.split('\n\n')
    
    return paragraphs.map((paragraph, index) => {
      // Handle headers
      if (paragraph.startsWith('# ')) {
        return <h1 key={index}>{paragraph.substring(2)}</h1>
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index}>{paragraph.substring(3)}</h2>
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index}>{paragraph.substring(4)}</h3>
      }
      
      // Handle bold text
      let formattedText = paragraph
      
      return <p key={index}>{formattedText}</p>
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading blog post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="page-container">
        <div className="error">{error || 'Blog post not found'}</div>
        <button onClick={() => navigate('/blog')} className="btn btn-primary">
          Back to Blog
        </button>
      </div>
    )
  }

  const handleImageError = (e) => {
    // Fallback to placeholder if image fails to load
    e.target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'
    e.target.onerror = null // Prevent infinite loop
  }

  return (
    <div className="blog-post-container">
      <button onClick={() => navigate('/blog')} className="back-button">
        ← Back to Blog
      </button>

      <article className="blog-post">
        {post.featured_image && (
          <div className="blog-post-image">
            <img 
              src={post.featured_image} 
              alt={post.title}
              onError={handleImageError}
            />
          </div>
        )}

        <div className="blog-post-header">
          {post.category && (
            <span className="blog-post-category">{post.category}</span>
          )}
          <h1 className="blog-post-title">{post.title}</h1>
          
          <div className="blog-post-meta">
            {author && (
              <span className="blog-post-author">By {author.full_name}</span>
            )}
            <span className="blog-post-date">
              {formatDate(post.published_at || post.created_at)}
            </span>
            {readingTime > 0 && (
              <span className="blog-post-reading-time">
                📖 {formatReadingTime(readingTime)}
              </span>
            )}
          </div>
        </div>

        <div className="blog-post-content">
          {formatContent(post.content)}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="blog-post-tags">
            <strong>Tags:</strong>
            {post.tags.map((tag, index) => (
              <span key={index} className="blog-post-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Social Share Buttons */}
      <SocialShare
        url={window.location.href}
        title={post.title}
        description={post.excerpt || post.title}
      />

      {/* Comments Section */}
      <Comments postId={post.id} />

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div className="related-posts">
          <h2>Related Articles</h2>
          <div className="related-posts-grid">
            {relatedPosts.map((relatedPost) => (
              <div
                key={relatedPost.id}
                className="related-post-card"
                onClick={() => navigate(`/blog/${relatedPost.slug}`)}
              >
                {relatedPost.featured_image && (
                  <div className="related-post-image">
                    <img src={relatedPost.featured_image} alt={relatedPost.title} />
                  </div>
                )}
                <div className="related-post-content">
                  {relatedPost.category && (
                    <span className="related-post-category">{relatedPost.category}</span>
                  )}
                  <h3 className="related-post-title">{relatedPost.title}</h3>
                  <span className="related-post-date">
                    {formatDate(relatedPost.published_at || relatedPost.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogPostPage


