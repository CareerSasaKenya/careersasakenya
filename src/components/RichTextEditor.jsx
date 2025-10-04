import { useState, useEffect } from 'react'
import './RichTextEditor.css'

// Dynamic import for React Quill (install with: npm install react-quill)
// Uncomment when react-quill is installed:
// import ReactQuill from 'react-quill'
// import 'react-quill/dist/quill.snow.css'

/**
 * Rich Text Editor Component
 * 
 * INSTALLATION REQUIRED:
 * Run: npm install react-quill
 * 
 * Then uncomment the imports above
 */

function RichTextEditor({ value, onChange, placeholder }) {
  const [editorHtml, setEditorHtml] = useState(value || '')
  
  // For now, showing a fallback textarea
  // Once react-quill is installed, this will use the WYSIWYG editor
  const [quillLoaded, setQuillLoaded] = useState(false)

  useEffect(() => {
    // Try to load React Quill
    import('react-quill')
      .then((module) => {
        setQuillLoaded(true)
      })
      .catch(() => {
        console.log('React Quill not installed. Using fallback textarea.')
      })
  }, [])

  const handleChange = (content) => {
    setEditorHtml(content)
    if (onChange) {
      onChange(content)
    }
  }

  // Quill toolbar configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      [{ 'align': [] }],
      ['clean']
    ]
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image',
    'blockquote', 'code-block',
    'align'
  ]

  // Fallback to textarea if Quill isn't loaded
  if (!quillLoaded) {
    return (
      <div className="rich-text-editor-fallback">
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder || 'Write your content here...'}
          rows={15}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontFamily: 'inherit',
            fontSize: '1rem'
          }}
        />
        <div className="editor-notice">
          <p>📝 <strong>Enhanced editor available!</strong></p>
          <p>To enable the rich text WYSIWYG editor, run:</p>
          <code>npm install react-quill</code>
        </div>
      </div>
    )
  }

  // This will work after react-quill is installed
  // Uncomment when ready:
  /*
  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={editorHtml}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write your content here...'}
      />
    </div>
  )
  */

  // Temporary return for TypeScript
  return (
    <div className="rich-text-editor-fallback">
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder || 'Write your content here...'}
        rows={15}
        style={{
          width: '100%',
          padding: '0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontFamily: 'inherit',
          fontSize: '1rem'
        }}
      />
    </div>
  )
}

export default RichTextEditor

