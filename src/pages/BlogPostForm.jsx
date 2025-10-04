import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ImageUpload from '../components/ImageUpload'
import './BlogPostForm.css'

function BlogPostForm() {
  const navigate = useNavigate()
  const { id } = useParams() // For edit mode (if using id instead of slug)
  const { profile, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    featured_image: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    status: 'draft',
    meta_description: '',
    meta_keywords: ''
  })

  useEffect(() => {
    // Check if user is admin
    if (profile && profile.role !== 'admin') {
      navigate('/unauthorized')
      return
    }

    if (id) {
      setIsEditMode(true)
      fetchPost()
    }
  }, [id, profile])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setFormData({
        title: data.title,
        slug: data.slug,
        featured_image: data.featured_image || '',
        content: data.content,
        excerpt: data.excerpt || '',
        category: data.category || '',
        tags: data.tags ? data.tags.join(', ') : '',
        status: data.status,
        meta_description: data.meta_description || '',
        meta_keywords: data.meta_keywords ? data.meta_keywords.join(', ') : ''
      })
    } catch (err) {
      console.error('Error fetching blog post:', err)
      setError('Failed to load blog post')
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from title if not in edit mode
    if (name === 'title' && !isEditMode) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.title || !formData.slug || !formData.content) {
        setError('Please fill in all required fields (Title, Slug, Content)')
        setLoading(false)
        return
      }

      // Parse tags and keywords into arrays
      const tags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : []
      
      const meta_keywords = formData.meta_keywords
        ? formData.meta_keywords.split(',').map(keyword => keyword.trim()).filter(Boolean)
        : []

      const postData = {
        title: formData.title,
        slug: formData.slug,
        featured_image: formData.featured_image || null,
        content: formData.content,
        excerpt: formData.excerpt || null,
        category: formData.category || null,
        tags: tags.length > 0 ? tags : null,
        status: formData.status,
        meta_description: formData.meta_description || null,
        meta_keywords: meta_keywords.length > 0 ? meta_keywords : null,
        author_id: user.id,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      }

      if (isEditMode) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id)

        if (error) throw error
        
        setSuccess(true)
        setTimeout(() => {
          navigate(`/blog/${formData.slug}`)
        }, 1500)
      } else {
        // Create new post
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData])

        if (error) throw error
        
        setSuccess(true)
        setTimeout(() => {
          navigate('/blog')
        }, 1500)
      }
    } catch (err) {
      console.error('Error saving blog post:', err)
      setError(err.message || 'Failed to save blog post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      navigate('/blog')
    } catch (err) {
      console.error('Error deleting blog post:', err)
      setError('Failed to delete blog post')
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
        <button 
          onClick={() => navigate('/blog')} 
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Blog post saved successfully!</div>}

      <form onSubmit={handleSubmit} className="blog-post-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter blog post title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">
              Slug * 
              <span className="help-text">(URL-friendly version of title)</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="blog-post-url-slug"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="featured_image">Featured Image</label>
            <div className="image-upload-options">
              <ImageUpload
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                currentImage={formData.featured_image}
                userId={user?.id}
              />
              <div className="or-divider">
                <span>OR</span>
              </div>
              <input
                type="url"
                id="featured_image"
                name="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                placeholder="Paste image URL directly"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Short description for blog listing page"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your blog post content here... (Supports basic markdown: # for headers, ## for subheaders, etc.)"
              rows="15"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Categorization</h3>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Career Advice, Industry Trends"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">
              Tags 
              <span className="help-text">(Comma-separated)</span>
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>SEO Settings</h3>
          
          <div className="form-group">
            <label htmlFor="meta_description">Meta Description</label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              placeholder="SEO-friendly description for search engines"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="meta_keywords">
              Meta Keywords 
              <span className="help-text">(Comma-separated)</span>
            </label>
            <input
              type="text"
              id="meta_keywords"
              name="meta_keywords"
              value={formData.meta_keywords}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Publishing</h3>
          
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <p className="help-text">
              {formData.status === 'draft' 
                ? 'This post will not be visible to the public' 
                : 'This post will be visible to everyone'}
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditMode ? 'Update Post' : 'Create Post')}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger"
              disabled={loading}
            >
              Delete Post
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default BlogPostForm


