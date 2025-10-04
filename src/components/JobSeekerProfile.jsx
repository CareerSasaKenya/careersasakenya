import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './JobSeekerProfile.css'

function JobSeekerProfile() {
  const { profile, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience_years: '',
    education: '',
    resume_url: '',
    cover_letter_template: ''
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        experience_years: profile.experience_years || '',
        education: profile.education || '',
        resume_url: profile.resume_url || '',
        cover_letter_template: profile.cover_letter_template || ''
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    
    if (name === 'skills') {
      // Handle skills as comma-separated string
      const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill)
      setFormData(prev => ({
        ...prev,
        [name]: skillsArray
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          skills: formData.skills,
          experience_years: formData.experience_years,
          education: formData.education,
          resume_url: formData.resume_url,
          cover_letter_template: formData.cover_letter_template,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Manage your professional information and documents</p>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Profile updated successfully!</div>}

        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="disabled-field"
            />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 700 000 000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Nairobi, Kenya"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Information</h3>
          
          <div className="form-group">
            <label htmlFor="bio">Professional Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills.join(', ')}
              onChange={handleChange}
              placeholder="e.g., JavaScript, React, Python, Project Management"
            />
            <small>Separate skills with commas</small>
          </div>

          <div className="form-group">
            <label htmlFor="experience_years">Years of Experience</label>
            <input
              type="number"
              id="experience_years"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              min="0"
              max="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="education">Education</label>
            <textarea
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="e.g., Bachelor of Computer Science, University of Nairobi (2020)"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Application Documents</h3>
          
          <div className="form-group">
            <label htmlFor="resume_url">Resume/CV URL</label>
            <input
              type="url"
              id="resume_url"
              name="resume_url"
              value={formData.resume_url}
              onChange={handleChange}
              placeholder="https://drive.google.com/your-resume"
            />
            <small>Upload your resume to Google Drive, Dropbox, or similar and paste the link here</small>
          </div>

          <div className="form-group">
            <label htmlFor="cover_letter_template">Cover Letter Template</label>
            <textarea
              id="cover_letter_template"
              name="cover_letter_template"
              value={formData.cover_letter_template}
              onChange={handleChange}
              placeholder="Write a general cover letter template that you can customize for each job application..."
              rows="8"
            />
            <small>This template will be used as a starting point for job applications</small>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default JobSeekerProfile
