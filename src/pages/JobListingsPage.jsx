import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import JobCard from '../components/JobCard'
import './JobListingsPage.css'

function JobListingsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setJobs(data || [])
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading jobs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Available Job Opportunities</h2>
        <p>Browse through our latest job postings</p>
      </div>

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs posted yet. Check back soon!</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

export default JobListingsPage

