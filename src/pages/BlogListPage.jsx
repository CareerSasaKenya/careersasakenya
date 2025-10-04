import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import BlogCard from '../components/BlogCard'
import './BlogListPage.css'

const POSTS_PER_PAGE = 9

function BlogListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])

  useEffect(() => {
    fetchPosts()
    fetchFilters()
  }, [currentPage, selectedCategory, selectedTag, searchQuery])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      // Apply tag filter
      if (selectedTag) {
        query = query.contains('tags', [selectedTag])
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
      }

      // Pagination
      const from = (currentPage - 1) * POSTS_PER_PAGE
      const to = from + POSTS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setPosts(data || [])
      setTotalPosts(count || 0)
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError('Failed to load blog posts. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilters = async () => {
    try {
      // Fetch unique categories
      const { data: categoriesData } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('status', 'published')
        .not('category', 'is', null)

      if (categoriesData) {
        const uniqueCategories = [...new Set(categoriesData.map(item => item.category))]
        setCategories(uniqueCategories.filter(Boolean))
      }

      // Fetch unique tags
      const { data: tagsData } = await supabase
        .from('blog_posts')
        .select('tags')
        .eq('status', 'published')
        .not('tags', 'is', null)

      if (tagsData) {
        const allTags = tagsData.flatMap(item => item.tags || [])
        const uniqueTags = [...new Set(allTags)]
        setTags(uniqueTags.filter(Boolean))
      }
    } catch (err) {
      console.error('Error fetching filters:', err)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPosts()
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleTagChange = (tag) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedTag('')
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && posts.length === 0) {
    return (
      <div className="page-container">
        <div className="loading">Loading blog posts...</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="blog-header">
        <h2>Blog & Career News</h2>
        <p>Insights, tips, and updates from the world of careers and recruitment</p>
      </div>

      {/* Search and Filters */}
      <div className="blog-filters">
        <form onSubmit={handleSearch} className="blog-search-form">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filter-row">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tag:</label>
            <select 
              value={selectedTag} 
              onChange={(e) => handleTagChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedCategory || selectedTag) && (
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {posts.length === 0 && !loading ? (
        <div className="no-posts">
          <p>No blog posts found. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BlogListPage


