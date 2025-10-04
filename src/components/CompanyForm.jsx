import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './CompanyForm.css'

function CompanyForm({ company, onSuccess, onCancel }) {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website: '',
    industry: '',
    location: '',
    size: '',
    description: ''
  })

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        logo_url: company.logo_url || '',
        website: company.website || '',
        industry: company.industry || '',
        location: company.location || '',
        size: company.size || '',
        description: company.description || ''
      })
    }
  }, [company])

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
      if (company?.id) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update(formData)
          .eq('id', company.id)

        if (error) throw error
      } else {
        // Create new company
        const { data: newCompany, error } = await supabase
          .from('companies')
          .insert([formData])
          .select()
          .single()

        if (error) throw error

        // Link the company to the employer profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ company_id: newCompany.id })
          .eq('id', profile.id)

        if (profileError) throw profileError
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess && onSuccess()
      }, 1000)
    } catch (err) {
      console.error('Error saving company:', err)
      setError('Failed to save company profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="company-form">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Company profile saved successfully!</div>}

      <div className="form-group">
        <label htmlFor="name">Company Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Tech Solutions Ltd"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="logo_url">Company Logo URL</label>
        <input
          type="url"
          id="logo_url"
          name="logo_url"
          value={formData.logo_url}
          onChange={handleChange}
          placeholder="https://example.com/logo.png"
        />
        <small>Enter a URL to your company logo image</small>
      </div>

      <div className="form-group">
        <label htmlFor="website">Website</label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://www.company.com"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="industry">Industry</label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="e.g., Technology, Finance, Healthcare"
          />
        </div>

        <div className="form-group">
          <label htmlFor="size">Company Size</label>
          <select
            id="size"
            name="size"
            value={formData.size}
            onChange={handleChange}
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
        </div>
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

      <div className="form-group">
        <label htmlFor="description">Company Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Tell us about your company..."
          rows="5"
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (company ? 'Update Company' : 'Create Company')}
        </button>
      </div>
    </form>
  )
}

export default CompanyForm


