import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './ImageUpload.css'

function ImageUpload({ onImageUploaded, currentImage, userId }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(currentImage || '')

  const handleFileSelect = async (event) => {
    try {
      setError(null)
      setUploading(true)
      setUploadProgress(0)

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('Image must be less than 5MB')
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      setUploadProgress(30)

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setUploadProgress(70)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)

      setUploadProgress(100)
      setPreview(publicUrl)
      
      // Call parent callback with the URL
      if (onImageUploaded) {
        onImageUploaded(publicUrl)
      }

      // Show success briefly
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)

    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    if (onImageUploaded) {
      onImageUploaded('')
    }
  }

  return (
    <div className="image-upload">
      {!preview ? (
        <div className="upload-area">
          <input
            type="file"
            id="image-upload-input"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
          />
          <label htmlFor="image-upload-input" className="upload-label">
            {uploading ? (
              <div className="upload-progress">
                <div className="spinner"></div>
                <p>Uploading... {uploadProgress}%</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p><strong>Click to upload</strong> or drag and drop</p>
                <p className="upload-hint">PNG, JPG, GIF, WebP up to 5MB</p>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="image-preview">
          <img src={preview} alt="Uploaded preview" />
          <div className="preview-actions">
            <button 
              type="button"
              onClick={handleRemove} 
              className="btn btn-remove"
            >
              Remove Image
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

      <p className="upload-info">
        ℹ️ Uploaded images are stored securely and publicly accessible
      </p>
    </div>
  )
}

export default ImageUpload

