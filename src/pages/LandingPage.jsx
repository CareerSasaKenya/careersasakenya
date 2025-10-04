import { Link } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Dream Job with <span className="brand">KaziBORA</span>
          </h1>
          <p className="hero-subtitle">
            Connect with top employers across Kenya and Africa. 
            Browse thousands of opportunities and take the next step in your career.
          </p>
          <div className="hero-actions">
            <Link to="/jobs" className="btn btn-primary btn-large">
              Browse Jobs
            </Link>
            <Link to="/post-job" className="btn btn-secondary btn-large">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Browse Opportunities</h3>
            <p>Explore hundreds of job listings from companies across various industries.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Easy Application</h3>
            <p>Apply to jobs with just a few clicks. Simple, fast, and efficient.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Find Your Match</h3>
            <p>Discover roles that align with your skills, experience, and career goals.</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of job seekers finding their perfect role</p>
          <Link to="/jobs" className="btn btn-primary btn-large">
            Explore Jobs Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage

