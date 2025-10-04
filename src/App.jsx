import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import JobListingsPage from './pages/JobListingsPage'
import JobPostPage from './pages/JobPostPage'
import JobDetailsPage from './pages/JobDetailsPage'
import CompanyProfilePage from './pages/CompanyProfilePage'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import BlogPostForm from './pages/BlogPostForm'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import JobSeekerProfile from './components/JobSeekerProfile'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobListingsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/companies/:id" element={<CompanyProfilePage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/post-job" 
            element={
              <ProtectedRoute allowedRoles={['employer', 'admin']}>
                <JobPostPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['employer', 'admin']}>
                <JobPostPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-blog" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BlogPostForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BlogPostForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['job_seeker']}>
                <JobSeekerProfile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App

