import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            <h1>KaziBORA</h1>
          </Link>
          <nav className="nav">
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              Home
            </Link>
            <Link 
              to="/jobs" 
              className={location.pathname === '/jobs' || location.pathname.startsWith('/jobs/') ? 'active' : ''}
            >
              Browse Jobs
            </Link>
            <Link 
              to="/blog" 
              className={location.pathname === '/blog' || location.pathname.startsWith('/blog/') ? 'active' : ''}
            >
              Blog
            </Link>
            
            {user && (profile?.role === 'employer' || profile?.role === 'admin') && (
              <Link 
                to="/post-job" 
                className={location.pathname === '/post-job' ? 'active' : ''}
              >
                Post Job
              </Link>
            )}

            {user && profile?.role === 'admin' && (
              <Link 
                to="/create-blog" 
                className={location.pathname === '/create-blog' ? 'active' : ''}
              >
                Create Blog
              </Link>
            )}

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={location.pathname === '/login' ? 'active' : ''}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-signup"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} KaziBORA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout

