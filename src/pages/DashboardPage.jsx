import { useAuth } from '../contexts/AuthContext'
import EmployerDashboard from './EmployerDashboard'
import JobSeekerDashboard from './JobSeekerDashboard'
import AdminDashboard from './AdminDashboard'

function DashboardPage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
  }

  // Route to correct dashboard based on role
  switch (profile?.role) {
    case 'employer':
      return <EmployerDashboard />
    case 'job_seeker':
      return <JobSeekerDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Role not recognized</h2>
          <p>Please contact support.</p>
        </div>
      )
  }
}

export default DashboardPage

