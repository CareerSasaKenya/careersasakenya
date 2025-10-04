import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import emailTemplates from './emailTemplates.js'

dotenv.config()

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html,
        text,
        replyTo: process.env.EMAIL_REPLY_TO
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log(`✅ Email sent to ${to}: ${info.messageId}`)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error)
      throw error
    }
  }

  async sendWelcomeEmail(userData) {
    const { email, full_name, role } = userData
    const { html, text } = emailTemplates.welcome(full_name, role)
    
    return await this.sendEmail({
      to: email,
      subject: `Welcome to KaziBORA Job Portal! 🎉`,
      html,
      text
    })
  }

  async sendApplicationConfirmation(applicationData) {
    const { applicant_email, applicant_name, job_title, company_name } = applicationData
    const { html, text } = emailTemplates.applicationConfirmation(
      applicant_name,
      job_title,
      company_name
    )
    
    return await this.sendEmail({
      to: applicant_email,
      subject: `Application Received: ${job_title}`,
      html,
      text
    })
  }

  async sendApplicationNotificationToEmployer(applicationData) {
    const { employer_email, employer_name, applicant_name, job_title, application_id } = applicationData
    const { html, text } = emailTemplates.applicationNotification(
      employer_name,
      applicant_name,
      job_title,
      application_id
    )
    
    return await this.sendEmail({
      to: employer_email,
      subject: `New Application: ${job_title}`,
      html,
      text
    })
  }

  async sendJobPostedConfirmation(jobData) {
    const { employer_email, employer_name, job_title, job_id } = jobData
    const { html, text } = emailTemplates.jobPosted(
      employer_name,
      job_title,
      job_id
    )
    
    return await this.sendEmail({
      to: employer_email,
      subject: `Job Posted Successfully: ${job_title}`,
      html,
      text
    })
  }

  async sendTestEmail(to) {
    const { html, text } = emailTemplates.test()
    
    return await this.sendEmail({
      to,
      subject: 'Test Email from KaziBORA Email Service',
      html,
      text
    })
  }

  async verifyConnection() {
    try {
      await this.transporter.verify()
      console.log('✅ SMTP connection verified')
      return true
    } catch (error) {
      console.error('❌ SMTP connection failed:', error)
      return false
    }
  }
}

export default new EmailService()


