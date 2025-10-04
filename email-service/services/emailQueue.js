import { supabase } from '../server.js'
import emailService from './emailService.js'

class EmailQueue {
  constructor() {
    this.processing = false
    this.queue = []
  }

  async queueApplicationEmails(application) {
    try {
      // Fetch application details with related data
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select(`
          id,
          cover_letter,
          created_at,
          applicant:profiles!applications_applicant_id_fkey (
            id,
            email,
            full_name
          ),
          job:jobs (
            id,
            title,
            company,
            employer_id,
            employer:profiles!jobs_employer_id_fkey (
              id,
              email,
              full_name
            )
          )
        `)
        .eq('id', application.id)
        .single()

      if (appError) throw appError

      // Send confirmation to candidate
      await emailService.sendApplicationConfirmation({
        applicant_email: appData.applicant.email,
        applicant_name: appData.applicant.full_name,
        job_title: appData.job.title,
        company_name: appData.job.company
      })

      // Send notification to employer
      await emailService.sendApplicationNotificationToEmployer({
        employer_email: appData.job.employer.email,
        employer_name: appData.job.employer.full_name,
        applicant_name: appData.applicant.full_name,
        job_title: appData.job.title,
        application_id: appData.id
      })

      console.log(`✅ Application emails sent for application ${application.id}`)
    } catch (error) {
      console.error('❌ Error queueing application emails:', error)
    }
  }

  async queueJobPostedEmail(job) {
    try {
      // Fetch job details with employer info
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          employer:profiles!jobs_employer_id_fkey (
            id,
            email,
            full_name
          )
        `)
        .eq('id', job.id)
        .single()

      if (jobError) throw jobError

      // Send confirmation to employer
      await emailService.sendJobPostedConfirmation({
        employer_email: jobData.employer.email,
        employer_name: jobData.employer.full_name,
        job_title: jobData.title,
        job_id: jobData.id
      })

      console.log(`✅ Job posted email sent for job ${job.id}`)
    } catch (error) {
      console.error('❌ Error queueing job posted email:', error)
    }
  }

  async queueWelcomeEmail(profile) {
    try {
      // Send welcome email
      await emailService.sendWelcomeEmail({
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role
      })

      console.log(`✅ Welcome email sent to ${profile.email}`)
    } catch (error) {
      console.error('❌ Error queueing welcome email:', error)
    }
  }

  startProcessing() {
    this.processing = true
    console.log('✅ Email queue processor started')
  }

  stopProcessing() {
    this.processing = false
    console.log('⏸️  Email queue processor stopped')
  }
}

export default new EmailQueue()


