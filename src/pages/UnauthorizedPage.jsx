import { Link } from 'react-router-dom'

function UnauthorizedPage() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '4rem 1rem',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</h1>
      <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        You don't have permission to access this page.
      </p>
      <Link to="/" className="btn btn-primary">
        Go to Home
      </Link>
    </div>
  )
}

export default UnauthorizedPage

