import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './ApplyModal.css'

function ApplyModal({ job, onClose, onSuccess }) {
  const { profile } = useAuth()
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_url: '',
    use_profile_resume: false,
    use_profile_cover_letter: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [profileData, setProfileData] = useState(null)

  useEffect(() => {
    // Fetch current profile data to check for stored resume/cover letter
    if (profile) {
      setProfileData(profile)
      // Pre-fill with profile data if available
      if (profile.resume_url) {
        setFormData(prev => ({
          ...prev,
          resume_url: profile.resume_url,
          use_profile_resume: true
        }))
      }
      if (profile.cover_letter_template) {
        setFormData(prev => ({
          ...prev,
          cover_letter: profile.cover_letter_template,
          use_profile_cover_letter: true
        }))
      }
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: job.id,
          applicant_id: profile.id,
          cover_letter: formData.cover_letter,
          resume_url: formData.resume_url || null,
          status: 'pending'
        })

      if (applicationError) throw applicationError

      setSubmitted(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error submitting application:', err)
      setError(err.message || 'Failed to submit application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h2>Apply for {job.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="applicant-info">
              <p><strong>Applying as:</strong> {profile.full_name} ({profile.email})</p>
            </div>

            {/* Profile Resume Section */}
            {profileData?.resume_url && (
              <div className="form-group profile-section">
                <div className="profile-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="use_profile_resume"
                      checked={formData.use_profile_resume}
                      onChange={handleChange}
                    />
                    <span>Use my stored resume</span>
                  </label>
                  <div className="profile-info">
                    <p><strong>Stored Resume:</strong> <a href={profileData.resume_url} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Cover Letter Section */}
            {profileData?.cover_letter_template && (
              <div className="form-group profile-section">
                <div className="profile-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="use_profile_cover_letter"
                      checked={formData.use_profile_cover_letter}
                      onChange={handleChange}
                    />
                    <span>Use my cover letter template</span>
                  </label>
                  <div className="profile-info">
                    <p><strong>Template Preview:</strong></p>
                    <div className="template-preview">
                      {profileData.cover_letter_template.substring(0, 200)}...
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="cover_letter">Cover Letter *</label>
              <textarea
                id="cover_letter"
                name="cover_letter"
                value={formData.cover_letter}
                onChange={handleChange}
                placeholder="Tell us why you're a great fit for this role..."
                rows="8"
                required
              />
              <small>Customize your cover letter for this specific job application</small>
            </div>

            <div className="form-group">
              <label htmlFor="resume_url">Resume URL</label>
              <input
                type="url"
                id="resume_url"
                name="resume_url"
                value={formData.resume_url}
                onChange={handleChange}
                placeholder="https://drive.google.com/your-resume"
                disabled={formData.use_profile_resume}
              />
              <small>
                {formData.use_profile_resume 
                  ? "Using your stored resume" 
                  : "Link to your resume on Google Drive, Dropbox, or similar"
                }
              </small>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-body">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Application Submitted!</h3>
              <p>Your application for <strong>{job.title}</strong> has been successfully submitted.</p>
              <p>The employer will review your application and may contact you at <strong>{profile.email}</strong>.</p>
              <p className="note">
                You can track your application status in your dashboard.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplyModal

