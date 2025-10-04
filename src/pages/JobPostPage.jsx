import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './JobPostPage.css'

function JobPostPage() {
  const navigate = useNavigate()
  const { id } = useParams() // For edit mode
  const { profile, isAdmin } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [userCompany, setUserCompany] = useState(null)
  const [allCompanies, setAllCompanies] = useState([])
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    apply_link: '',
    company_id: ''
  })

  useEffect(() => {
    if (id) {
      setIsEditMode(true)
      fetchJob()
    } else {
      fetchUserCompany()
      if (isAdmin) {
        fetchAllCompanies()
      }
    }
  }, [id])

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      // Check if user has permission to edit
      if (data.employer_id !== profile.id && profile.role !== 'admin') {
        navigate('/unauthorized')
        return
      }

      setFormData({
        title: data.title,
        company: data.company || '',
        location: data.location,
        description: data.description,
        salary: data.salary || '',
        apply_link: data.apply_link,
        company_id: data.company_id || ''
      })

      // Fetch companies for admin if editing
      if (isAdmin) {
        await fetchAllCompanies()
      }
    } catch (err) {
      console.error('Error fetching job:', err)
      setError('Failed to load job details')
    }
  }

  const fetchUserCompany = async () => {
    try {
      // Fetch employer's company
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', profile.id)
        .single()

      if (profileError) throw profileError

      if (profileData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .single()

        if (companyError) throw companyError
        setUserCompany(companyData)
      }
    } catch (err) {
      console.error('Error fetching company:', err)
    }
  }

  const fetchAllCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')

      if (error) throw error
      setAllCompanies(data || [])
    } catch (err) {
      console.error('Error fetching companies:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // For employers, ensure they have a company
      if (!isAdmin && !isEditMode && !userCompany) {
        setError('Please create your company profile first before posting jobs.')
        setLoading(false)
        return
      }

      // Prepare job data
      const jobData = {
        title: formData.title,
        location: formData.location,
        description: formData.description,
        salary: formData.salary || null,
        apply_link: formData.apply_link
      }

      // Handle company linking
      if (isAdmin) {
        // Admin can choose a company or leave it empty
        if (formData.company_id) {
          jobData.company_id = formData.company_id
          // Set company name from selected company
          const selectedCompany = allCompanies.find(c => c.id === formData.company_id)
          jobData.company = selectedCompany?.name || null
        } else {
          jobData.company_id = null
          jobData.company = formData.company || null
        }
      } else {
        // Employer must link to their company
        jobData.company_id = userCompany.id
        jobData.company = userCompany.name
      }

      if (isEditMode) {
        // Update existing job
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', id)

        if (error) throw error
        setSuccess(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        // Create new job
        const { error } = await supabase
          .from('jobs')
          .insert([{
            ...jobData,
            employer_id: profile.id
          }])

        if (error) throw error
        setSuccess(true)
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      }
    } catch (err) {
      console.error('Error saving job:', err)
      setError(`Failed to ${isEditMode ? 'update' : 'post'} job. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{isEditMode ? 'Edit Job' : 'Post a New Job'}</h2>
        <p>{isEditMode ? 'Update the job details below' : 'Fill in the details below to create a new job posting'}</p>
      </div>

      <form onSubmit={handleSubmit} className="job-form">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Job {isEditMode ? 'updated' : 'posted'} successfully! Redirecting...</div>}

        {/* Show company info for employers */}
        {!isAdmin && !isEditMode && (
          <div className="form-info">
            {userCompany ? (
              <p>✓ This job will be posted under <strong>{userCompany.name}</strong></p>
            ) : (
              <div className="alert alert-error">
                You need to create your company profile first.{' '}
                <a href="/dashboard" style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Go to dashboard
                </a>
              </div>
            )}
          </div>
        )}

        {/* Company selection for Admin */}
        {isAdmin && (
          <div className="form-group">
            <label htmlFor="company_id">Link to Company (Optional)</label>
            <select
              id="company_id"
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
            >
              <option value="">No company (Admin direct post)</option>
              {allCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            <small>Choose a company or leave empty for a direct admin post</small>
          </div>
        )}

        {/* Manual company name for Admin when no company selected */}
        {isAdmin && !formData.company_id && (
          <div className="form-group">
            <label htmlFor="company">Company Name (Optional)</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., Tech Corp (or leave empty)"
            />
            <small>Optional: Enter a company name if not linking to a profile</small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Job Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Senior Software Engineer"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Nairobi, Kenya or Remote"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="salary">Salary Range</label>
          <input
            type="text"
            id="salary"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="e.g., KES 80,000 - 120,000 per month"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role, responsibilities, requirements, etc."
            rows="8"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="apply_link">Application Link/Email *</label>
          <input
            type="text"
            id="apply_link"
            name="apply_link"
            value={formData.apply_link}
            onChange={handleChange}
            placeholder="e.g., apply@company.com or https://company.com/apply"
            required
          />
          <small>Enter an email address or URL where candidates can apply</small>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (isEditMode ? 'Updating...' : 'Posting...') : (isEditMode ? 'Update Job' : 'Post Job')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default JobPostPage

