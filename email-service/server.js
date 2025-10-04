import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import emailService from './services/emailService.js'
import emailQueue from './services/emailQueue.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email service is running' })
})

// Start the email queue processor
emailQueue.startProcessing()

// Listen for database changes (Supabase Realtime)
const setupRealtimeListeners = () => {
  // Listen for new applications
  supabase
    .channel('applications-channel')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'applications' },
      async (payload) => {
        console.log('New application received:', payload.new.id)
        await emailQueue.queueApplicationEmails(payload.new)
      }
    )
    .subscribe()

  // Listen for new jobs
  supabase
    .channel('jobs-channel')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'jobs' },
      async (payload) => {
        console.log('New job posted:', payload.new.id)
        await emailQueue.queueJobPostedEmail(payload.new)
      }
    )
    .subscribe()

  // Listen for new profiles (registrations)
  supabase
    .channel('profiles-channel')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'profiles' },
      async (payload) => {
        console.log('New user registered:', payload.new.id)
        await emailQueue.queueWelcomeEmail(payload.new)
      }
    )
    .subscribe()

  console.log('✅ Realtime listeners setup complete')
}

// Manual send email endpoint (for testing or manual triggers)
app.post('/send-email', async (req, res) => {
  try {
    const { type, data } = req.body
    
    let result
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(data)
        break
      case 'application':
        result = await emailService.sendApplicationConfirmation(data)
        break
      case 'application-notification':
        result = await emailService.sendApplicationNotificationToEmployer(data)
        break
      case 'job-posted':
        result = await emailService.sendJobPostedConfirmation(data)
        break
      default:
        return res.status(400).json({ error: 'Invalid email type' })
    }
    
    res.json({ success: true, result })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ error: 'Failed to send email', details: error.message })
  }
})

// Test email endpoint
app.post('/test-email', async (req, res) => {
  try {
    const { to } = req.body
    await emailService.sendTestEmail(to)
    res.json({ success: true, message: 'Test email sent' })
  } catch (error) {
    console.error('Error sending test email:', error)
    res.status(500).json({ error: 'Failed to send test email', details: error.message })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Email service running on port ${PORT}`)
  console.log(`✅ Environment: ${process.env.NODE_ENV}`)
  console.log(`✅ Frontend URL: ${process.env.FRONTEND_URL}`)
  
  // Setup realtime listeners
  setupRealtimeListeners()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  emailQueue.stopProcessing()
  process.exit(0)
})

export { supabase }


