import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import JobCard from '../components/JobCard'
import './CompanyProfilePage.css'

function CompanyProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCompanyAndJobs()
  }, [id])

  const fetchCompanyAndJobs = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (companyError) throw companyError

      setCompany(companyData)

      // Fetch jobs for this company
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', id)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      setJobs(jobsData || [])
    } catch (err) {
      console.error('Error fetching company:', err)
      setError('Failed to load company profile.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading company profile...</div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="page-container">
        <div className="error">{error || 'Company not found'}</div>
        <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate('/jobs')}>
        ← Back to Jobs
      </button>

      <div className="company-profile-page">
        <div className="company-header">
          {company.logo_url && (
            <div className="company-logo-large">
              <img src={company.logo_url} alt={company.name} />
            </div>
          )}
          <div className="company-info">
            <h1>{company.name}</h1>
            
            <div className="company-meta">
              {company.industry && (
                <span className="meta-tag">
                  <span className="icon">🏭</span>
                  {company.industry}
                </span>
              )}
              {company.location && (
                <span className="meta-tag">
                  <span className="icon">📍</span>
                  {company.location}
                </span>
              )}
              {company.size && (
                <span className="meta-tag">
                  <span className="icon">👥</span>
                  {company.size}
                </span>
              )}
            </div>

            {company.website && (
              <div className="company-website">
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  🌐 Visit Website
                </a>
              </div>
            )}
          </div>
        </div>

        {company.description && (
          <div className="company-about">
            <h2>About {company.name}</h2>
            <p>{company.description}</p>
          </div>
        )}

        <div className="company-jobs-section">
          <h2>
            Open Positions
            <span className="job-count">({jobs.length})</span>
          </h2>
          
          {jobs.length === 0 ? (
            <div className="empty-state">
              <p>No open positions at the moment.</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyProfilePage


