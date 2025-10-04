import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './JobCard.css'

function JobCard({ job }) {
  const navigate = useNavigate()
  const [companyData, setCompanyData] = useState(null)

  useEffect(() => {
    if (job.company_id) {
      fetchCompany()
    }
  }, [job.company_id])

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, logo_url')
        .eq('id', job.company_id)
        .single()

      if (error) throw error
      setCompanyData(data)
    } catch (err) {
      console.error('Error fetching company:', err)
    }
  }

  const truncateDescription = (text, maxLength = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleCompanyClick = (e) => {
    e.stopPropagation()
    if (companyData?.id) {
      navigate(`/companies/${companyData.id}`)
    }
  }

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        
        {/* Company info with logo */}
        {companyData ? (
          <div className="job-company-info" onClick={handleCompanyClick}>
            {companyData.logo_url && (
              <img 
                src={companyData.logo_url} 
                alt={companyData.name}
                className="company-logo-small"
              />
            )}
            <span className="job-company clickable">{companyData.name}</span>
          </div>
        ) : job.company ? (
          <span className="job-company">{job.company}</span>
        ) : (
          <span className="job-company admin-post">Posted by Admin</span>
        )}
      </div>
      
      <div className="job-location">
        📍 {job.location}
      </div>
      <p className="job-description">
        {truncateDescription(job.description)}
      </p>
      {job.salary && (
        <div className="job-salary">
          💰 {job.salary}
        </div>
      )}
      <button 
        className="btn btn-primary"
        onClick={() => navigate(`/jobs/${job.id}`)}
      >
        View Details
      </button>
    </div>
  )
}

export default JobCard

