import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import CompanyForm from '../components/CompanyForm'
import './Dashboard.css'

function EmployerDashboard() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [activeTab, setActiveTab] = useState('jobs') // 'jobs' or 'company'

  useEffect(() => {
    fetchMyJobs()
    fetchCompany()
  }, [])

  const fetchMyJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load your jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchCompany = async () => {
    try {
      // First get the updated profile with company_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', profile.id)
        .single()

      if (profileError) throw profileError

      if (profileData?.company_id) {
        // Fetch the company details
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .single()

        if (companyError) throw companyError
        setCompany(companyData)
      }
    } catch (err) {
      console.error('Error fetching company:', err)
      // Not critical error, just means no company yet
    }
  }

  const handleCompanySuccess = () => {
    setShowCompanyForm(false)
    fetchCompany()
  }

  const handleDelete = async (jobId) => {
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

  const handleEdit = (jobId) => {
    navigate(`/jobs/${jobId}/edit`)
  }

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2>Employer Dashboard</h2>
          <p>Welcome back, {profile?.full_name}!</p>
        </div>
        <Link to="/post-job" className="btn btn-primary">
          + Add New Job
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!company && (
        <div className="alert alert-info">
          <strong>Setup Required:</strong> Please create your company profile to get started.
        </div>
      )}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{jobs.length}</h3>
          <p>Active Job Postings</p>
        </div>
        <div className="stat-card">
          <h3>{company ? '✓' : '✗'}</h3>
          <p>Company Profile</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Job Postings
        </button>
        <button 
          className={`tab ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          Company Profile
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="dashboard-section">
          <h3>Your Job Postings</h3>
          
          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>You haven't posted any jobs yet.</p>
              {company ? (
                <Link to="/post-job" className="btn btn-primary">
                  Post Your First Job
                </Link>
              ) : (
                <p className="text-muted">Create your company profile first to start posting jobs.</p>
              )}
            </div>
          ) : (
            <div className="jobs-table">
              <table>
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Posted</th>
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
                      <td>{job.location}</td>
                      <td>{new Date(job.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          onClick={() => handleEdit(job.id)}
                          className="btn btn-small btn-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
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

      {/* Company Tab */}
      {activeTab === 'company' && (
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Company Profile</h3>
            {company && !showCompanyForm && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCompanyForm(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {showCompanyForm || !company ? (
            <CompanyForm 
              company={company}
              onSuccess={handleCompanySuccess}
              onCancel={company ? () => setShowCompanyForm(false) : null}
            />
          ) : (
            <div className="company-profile-view">
              {company.logo_url && (
                <div className="company-logo">
                  <img src={company.logo_url} alt={company.name} />
                </div>
              )}
              <div className="company-details">
                <h2>{company.name}</h2>
                {company.industry && <p><strong>Industry:</strong> {company.industry}</p>}
                {company.location && <p><strong>Location:</strong> {company.location}</p>}
                {company.size && <p><strong>Company Size:</strong> {company.size}</p>}
                {company.website && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {company.website}
                    </a>
                  </p>
                )}
                {company.description && (
                  <div className="company-description">
                    <strong>About:</strong>
                    <p>{company.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EmployerDashboard

