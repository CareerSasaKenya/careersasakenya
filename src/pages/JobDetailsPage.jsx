import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ApplyModal from '../components/ApplyModal'
import './JobDetailsPage.css'

function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile, isJobSeeker } = useAuth()
  const [job, setJob] = useState(null)
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [bookmarkLoading, setBookmarkLoading] = useState(false)

  useEffect(() => {
    fetchJob()
    if (user && isJobSeeker) {
      checkBookmarkStatus()
      checkApplicationStatus()
    }
  }, [id, user])

  const fetchJob = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setJob(data)

      // Fetch company if job has company_id
      if (data.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', data.company_id)
          .single()

        if (!companyError && companyData) {
          setCompany(companyData)
        }
      }
    } catch (err) {
      console.error('Error fetching job:', err)
      setError('Failed to load job details.')
    } finally {
      setLoading(false)
    }
  }

  const checkBookmarkStatus = async () => {
    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('job_id', id)
        .eq('user_id', profile.id)
        .single()

      setIsBookmarked(!!data)
    } catch (err) {
      // No bookmark found
      setIsBookmarked(false)
    }
  }

  const checkApplicationStatus = async () => {
    try {
      const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', id)
        .eq('applicant_id', profile.id)
        .single()

      setHasApplied(!!data)
    } catch (err) {
      // No application found
      setHasApplied(false)
    }
  }

  const toggleBookmark = async () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })
      return
    }

    if (!isJobSeeker) {
      alert('Only job seekers can bookmark jobs')
      return
    }

    setBookmarkLoading(true)
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('job_id', id)
          .eq('user_id', profile.id)

        if (error) throw error
        setIsBookmarked(false)
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({ job_id: id, user_id: profile.id })

        if (error) throw error
        setIsBookmarked(true)
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err)
      alert('Failed to update bookmark')
    } finally {
      setBookmarkLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading job details...</div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="page-container">
        <div className="error">{error || 'Job not found'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </button>
      </div>
    )
  }

  const handleApply = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })
      return
    }

    if (!isJobSeeker) {
      alert('Only job seekers can apply to jobs')
      return
    }

    if (hasApplied) {
      alert('You have already applied to this job')
      return
    }

    // Check if job has external application URL
    if (job.apply_link && (job.apply_link.startsWith('http') || job.apply_link.includes('@'))) {
      // External URL - redirect to it
      window.open(job.apply_link, '_blank')
      return
    }

    // Internal application - show modal
    setShowApplyModal(true)
  }

  const handleApplicationSubmitted = () => {
    setHasApplied(true)
    setShowApplyModal(false)
  }

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate('/jobs')}>
        ← Back to Jobs
      </button>

      <div className="job-details">
        <div className="job-details-header">
          <div>
            <h1 className="job-details-title">{job.title}</h1>
            
            {/* Company info section */}
            {company ? (
              <div 
                className="job-company-section clickable"
                onClick={() => navigate(`/companies/${company.id}`)}
              >
                {company.logo_url && (
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="company-logo-medium"
                  />
                )}
                <div className="company-info-text">
                  <span className="company-name">{company.name}</span>
                  {company.location && (
                    <span className="company-location-text">{company.location}</span>
                  )}
                </div>
              </div>
            ) : job.company ? (
              <div className="job-company-section">
                <span className="company-name">{job.company}</span>
              </div>
            ) : (
              <div className="job-company-section">
                <span className="company-name admin-post">Posted by Admin</span>
              </div>
            )}
            
            <div className="job-details-meta">
              <span className="meta-item">📍 {job.location}</span>
              {job.salary && <span className="meta-item">💰 {job.salary}</span>}
            </div>
          </div>
          <div className="job-actions">
            {isJobSeeker && (
              <button 
                className={`btn btn-bookmark ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
              >
                {isBookmarked ? '★ Saved' : '☆ Save'}
              </button>
            )}
            <button 
              className="btn btn-primary btn-large" 
              onClick={handleApply}
              disabled={hasApplied}
            >
              {hasApplied ? '✓ Applied' : 'Apply Now'}
            </button>
          </div>
        </div>

        {/* Company About Section */}
        {company && company.description && (
          <div className="company-about-section">
            <h3>About {company.name}</h3>
            <p>{company.description}</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate(`/companies/${company.id}`)}
            >
              View Company Profile
            </button>
          </div>
        )}

        <div className="job-details-content">
          <h3>Job Description</h3>
          <div className="job-description-text">
            {job.description.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="job-details-footer">
          <button 
            className="btn btn-primary btn-large" 
            onClick={handleApply}
            disabled={hasApplied}
          >
            {hasApplied ? '✓ Applied' : 'Apply Now'}
          </button>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplicationSubmitted}
        />
      )}
    </div>
  )
}

export default JobDetailsPage

