import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [users, setUsers] = useState([])
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('jobs') // jobs, users, or blog

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch all jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          profiles!jobs_employer_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch all blog posts (including drafts)
      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles!blog_posts_author_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (blogError) throw blogError

      setJobs(jobsData || [])
      setUsers(usersData || [])
      setBlogPosts(blogData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)

      if (error) throw error
      
      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (err) {
      console.error('Error deleting job:', err)
      alert('Failed to delete job')
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (err) {
      console.error('Error updating user role:', err)
      alert('Failed to update user role')
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-admin'
      case 'employer': return 'role-employer'
      case 'job_seeker': return 'role-seeker'
      default: return ''
    }
  }

  const handleTogglePostStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    try {
      const updateData = {
        status: newStatus
      }
      
      // Set published_at when publishing, null when unpublishing
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString()
      } else {
        updateData.published_at = null
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId)

      if (error) throw error
      
      setBlogPosts(blogPosts.map(post => 
        post.id === postId ? { ...post, status: newStatus, published_at: updateData.published_at } : post
      ))
    } catch (err) {
      console.error('Error updating post status:', err)
      alert('Failed to update post status')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      
      setBlogPosts(blogPosts.filter(post => post.id !== postId))
    } catch (err) {
      console.error('Error deleting blog post:', err)
      alert('Failed to delete blog post')
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading admin dashboard...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Welcome, {profile?.full_name}</p>
        </div>
        <div className="header-actions">
          <Link to="/post-job" className="btn btn-primary">
            + Post Job
          </Link>
          <Link to="/create-blog" className="btn btn-primary">
            + Create Blog Post
          </Link>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{jobs.length}</h3>
          <p>Total Jobs</p>
        </div>
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="stat-card">
          <h3>{blogPosts.filter(p => p.status === 'published').length}</h3>
          <p>Published Posts</p>
        </div>
        <div className="stat-card">
          <h3>{blogPosts.filter(p => p.status === 'draft').length}</h3>
          <p>Draft Posts</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          All Jobs
        </button>
        <button
          className={`tab ${activeTab === 'blog' ? 'active' : ''}`}
          onClick={() => setActiveTab('blog')}
        >
          Blog Posts
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
      </div>

      {activeTab === 'jobs' && (
        <div className="dashboard-section">
          <h3>All Job Postings</h3>
          
          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>No jobs posted yet.</p>
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Posted By</th>
                    <th>Location</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <Link to={`/jobs/${job.id}`} className="job-title-link">
                          {job.title}
                        </Link>
                      </td>
                      <td>{job.company}</td>
                      <td>{job.profiles?.full_name || 'Unknown'}</td>
                      <td>{job.location}</td>
                      <td>{new Date(job.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}/edit`)}
                          className="btn btn-small btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="btn btn-small btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'blog' && (
        <div className="dashboard-section">
          <h3>All Blog Posts</h3>
          
          {blogPosts.length === 0 ? (
            <div className="empty-state">
              <p>No blog posts yet. <Link to="/create-blog">Create your first post</Link></p>
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        {post.status === 'published' ? (
                          <Link to={`/blog/${post.slug}`} className="job-title-link">
                            {post.title}
                          </Link>
                        ) : (
                          <span>{post.title}</span>
                        )}
                      </td>
                      <td>{post.profiles?.full_name || 'Unknown'}</td>
                      <td>{post.category || '-'}</td>
                      <td>
                        <span className={`status-badge status-${post.status}`}>
                          {post.status}
                        </span>
                      </td>
                      <td>
                        {post.published_at 
                          ? new Date(post.published_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleTogglePostStatus(post.id, post.status)}
                          className={`btn btn-small ${post.status === 'published' ? 'btn-warning' : 'btn-success'}`}
                          title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {post.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => navigate(`/blog/${post.id}/edit`)}
                          className="btn btn-small btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="btn btn-small btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="dashboard-section">
          <h3>All Users</h3>
          
          {users.length === 0 ? (
            <div className="empty-state">
              <p>No users registered yet.</p>
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Company</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.company_name || '-'}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="role-select"
                          disabled={user.id === profile.id}
                        >
                          <option value="job_seeker">Job Seeker</option>
                          <option value="employer">Employer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

