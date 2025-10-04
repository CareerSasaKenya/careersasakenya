import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

function JobSeekerDashboard() {
  const { profile } = useAuth()
  const [applications, setApplications] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('applications') // applications or bookmarks

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch applications
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            company,
            location,
            created_at
          )
        `)
        .eq('applicant_id', profile.id)
        .order('created_at', { ascending: false })

      if (appsError) throw appsError

      // Fetch bookmarks
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select(`
          *,
          jobs (
            id,
            title,
            company,
            location,
            salary,
            created_at
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      if (bookmarksError) throw bookmarksError

      setApplications(appsData || [])
      setBookmarks(bookmarksData || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)

      if (error) throw error
      
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId))
    } catch (err) {
      console.error('Error removing bookmark:', err)
      alert('Failed to remove bookmark')
    }
  }

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Job Seeker Dashboard</h2>
          <p>Welcome back, {profile?.full_name}!</p>
        </div>
        <div className="header-actions">
          <Link to="/profile" className="btn btn-secondary">
            Manage Profile
          </Link>
          <Link to="/jobs" className="btn btn-primary">
            Browse Jobs
          </Link>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{applications.length}</h3>
          <p>Applications Submitted</p>
        </div>
        <div className="stat-card">
          <h3>{bookmarks.length}</h3>
          <p>Saved Jobs</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          My Applications
        </button>
        <button
          className={`tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          Saved Jobs
        </button>
      </div>

      {activeTab === 'applications' && (
        <div className="dashboard-section">
          <h3>Your Applications</h3>
          
          {applications.length === 0 ? (
            <div className="empty-state">
              <p>You haven't applied to any jobs yet.</p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Available Jobs
              </Link>
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Applied On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <Link to={`/jobs/${app.jobs.id}`} className="job-title-link">
                          {app.jobs.title}
                        </Link>
                      </td>
                      <td>{app.jobs.company}</td>
                      <td>{app.jobs.location}</td>
                      <td>{new Date(app.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge status-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="dashboard-section">
          <h3>Saved Jobs</h3>
          
          {bookmarks.length === 0 ? (
            <div className="empty-state">
              <p>You haven't saved any jobs yet.</p>
              <Link to="/jobs" className="btn btn-primary">
                Browse Available Jobs
              </Link>
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Saved On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookmarks.map((bookmark) => (
                    <tr key={bookmark.id}>
                      <td>
                        <Link to={`/jobs/${bookmark.jobs.id}`} className="job-title-link">
                          {bookmark.jobs.title}
                        </Link>
                      </td>
                      <td>{bookmark.jobs.company}</td>
                      <td>{bookmark.jobs.location}</td>
                      <td>{new Date(bookmark.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleRemoveBookmark(bookmark.id)}
                          className="btn btn-small btn-danger"
                        >
                          Remove
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
    </div>
  )
}

export default JobSeekerDashboard

