import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './BlogCard.css'

function BlogCard({ post }) {
  const navigate = useNavigate()
  const [author, setAuthor] = useState(null)

  useEffect(() => {
    if (post.author_id) {
      fetchAuthor()
    }
  }, [post.author_id])

  const fetchAuthor = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', post.author_id)
        .single()

      if (error) throw error
      setAuthor(data)
    } catch (err) {
      console.error('Error fetching author:', err)
    }
  }

  const truncateExcerpt = (text, maxLength = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleImageError = (e) => {
    // Fallback to placeholder if image fails to load
    e.target.src = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'
    e.target.onerror = null // Prevent infinite loop
  }

  return (
    <div className="blog-card" onClick={() => navigate(`/blog/${post.slug}`)}>
      {post.featured_image && (
        <div className="blog-card-image">
          <img 
            src={post.featured_image} 
            alt={post.title}
            onError={handleImageError}
          />
        </div>
      )}
      
      <div className="blog-card-content">
        <div className="blog-card-meta">
          {post.category && (
            <span className="blog-category">{post.category}</span>
          )}
          <span className="blog-date">
            {formatDate(post.published_at || post.created_at)}
          </span>
        </div>

        <h3 className="blog-title">{post.title}</h3>
        
        <p className="blog-excerpt">
          {truncateExcerpt(post.excerpt || post.content)}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="blog-tags">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="blog-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="blog-footer">
          {author && (
            <span className="blog-author">By {author.full_name}</span>
          )}
          <button className="btn btn-link">
            Read More →
          </button>
        </div>
      </div>
    </div>
  )
}

export default BlogCard


