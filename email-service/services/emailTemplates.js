import dotenv from 'dotenv'
dotenv.config()

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

// Base HTML template wrapper
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KaziBORA Job Portal</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .email-body {
      padding: 30px;
    }
    .email-body h2 {
      color: #667eea;
      margin-top: 0;
    }
    .email-body p {
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 500;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
    }
    .email-footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .email-footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>🚀 KaziBORA</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Connecting Talent with Opportunity</p>
    </div>
    <div class="email-body">
      ${content}
    </div>
    <div class="email-footer">
      <p>© ${new Date().getFullYear()} KaziBORA Job Portal. All rights reserved.</p>
      <p>
        <a href="${FRONTEND_URL}">Visit Portal</a> | 
        <a href="${FRONTEND_URL}/jobs">Browse Jobs</a> | 
        <a href="${FRONTEND_URL}/dashboard">Dashboard</a>
      </p>
      <p style="font-size: 12px; color: #999; margin-top: 15px;">
        You're receiving this email because you have an account with KaziBORA Job Portal.
      </p>
    </div>
  </div>
</body>
</html>
`

const emailTemplates = {
  // Welcome email for new users
  welcome: (fullName, role) => {
    const roleMessage = {
      job_seeker: 'Start browsing exciting job opportunities today!',
      employer: 'Start posting jobs and finding great talent!',
      admin: 'You have full access to manage the platform.'
    }

    const html = baseTemplate(`
      <h2>Welcome to KaziBORA, ${fullName}! 🎉</h2>
      <p>Thank you for joining KaziBORA Job Portal. We're excited to have you as part of our community!</p>
      <p><strong>Your account type:</strong> ${role.replace('_', ' ').toUpperCase()}</p>
      <p>${roleMessage[role] || 'Welcome aboard!'}</p>
      <div class="info-box">
        <strong>Getting Started:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${role === 'job_seeker' ? `
            <li>Complete your profile</li>
            <li>Browse available jobs</li>
            <li>Apply to positions that match your skills</li>
            <li>Save jobs for later</li>
          ` : ''}
          ${role === 'employer' ? `
            <li>Set up your company profile</li>
            <li>Post your first job</li>
            <li>Review applications</li>
            <li>Find the perfect candidates</li>
          ` : ''}
        </ul>
      </div>
      <center>
        <a href="${FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
      </center>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The KaziBORA Team</p>
    `)

    const text = `
Welcome to KaziBORA, ${fullName}!

Thank you for joining KaziBORA Job Portal. We're excited to have you as part of our community!

Your account type: ${role.replace('_', ' ').toUpperCase()}

${roleMessage[role] || 'Welcome aboard!'}

Visit your dashboard: ${FRONTEND_URL}/dashboard

Best regards,
The KaziBORA Team
    `

    return { html, text }
  },

  // Application confirmation for candidates
  applicationConfirmation: (applicantName, jobTitle, companyName) => {
    const html = baseTemplate(`
      <h2>Application Received! ✓</h2>
      <p>Hi ${applicantName},</p>
      <p>Thank you for applying to the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
      <p>Your application has been successfully submitted and is now being reviewed by the employer.</p>
      <div class="info-box">
        <strong>What's Next?</strong>
        <p style="margin: 10px 0;">The employer will review your application and reach out to you directly if they'd like to move forward. This typically takes 5-10 business days.</p>
      </div>
      <center>
        <a href="${FRONTEND_URL}/dashboard" class="button">View My Applications</a>
      </center>
      <p>In the meantime, feel free to explore other opportunities on our platform.</p>
      <p>Good luck!<br>The KaziBORA Team</p>
    `)

    const text = `
Application Received!

Hi ${applicantName},

Thank you for applying to the ${jobTitle} position at ${companyName}.

Your application has been successfully submitted and is now being reviewed by the employer.

What's Next?
The employer will review your application and reach out to you directly if they'd like to move forward. This typically takes 5-10 business days.

View your applications: ${FRONTEND_URL}/dashboard

Good luck!
The KaziBORA Team
    `

    return { html, text }
  },

  // Application notification for employers
  applicationNotification: (employerName, applicantName, jobTitle, applicationId) => {
    const html = baseTemplate(`
      <h2>New Application Received! 📋</h2>
      <p>Hi ${employerName},</p>
      <p>You have received a new application for your <strong>${jobTitle}</strong> position.</p>
      <div class="info-box">
        <strong>Applicant:</strong> ${applicantName}<br>
        <strong>Position:</strong> ${jobTitle}<br>
        <strong>Received:</strong> ${new Date().toLocaleDateString()}
      </div>
      <p>Review the application details, including the candidate's cover letter and resume, to determine if they're a good fit for your team.</p>
      <center>
        <a href="${FRONTEND_URL}/dashboard" class="button">Review Application</a>
      </center>
      <p>Best regards,<br>The KaziBORA Team</p>
    `)

    const text = `
New Application Received!

Hi ${employerName},

You have received a new application for your ${jobTitle} position.

Applicant: ${applicantName}
Position: ${jobTitle}
Received: ${new Date().toLocaleDateString()}

Review the application: ${FRONTEND_URL}/dashboard

Best regards,
The KaziBORA Team
    `

    return { html, text }
  },

  // Job posted confirmation for employers
  jobPosted: (employerName, jobTitle, jobId) => {
    const html = baseTemplate(`
      <h2>Job Posted Successfully! 🎉</h2>
      <p>Hi ${employerName},</p>
      <p>Great news! Your job posting for <strong>${jobTitle}</strong> is now live on KaziBORA Job Portal.</p>
      <div class="info-box">
        <strong>What Happens Now?</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Your job is visible to all job seekers</li>
          <li>Candidates can apply directly through the platform</li>
          <li>You'll receive email notifications for new applications</li>
          <li>Review and manage applications from your dashboard</li>
        </ul>
      </div>
      <center>
        <a href="${FRONTEND_URL}/jobs/${jobId}" class="button">View Job Posting</a>
      </center>
      <p>Good luck finding the perfect candidate!</p>
      <p>Best regards,<br>The KaziBORA Team</p>
    `)

    const text = `
Job Posted Successfully!

Hi ${employerName},

Great news! Your job posting for ${jobTitle} is now live on KaziBORA Job Portal.

What Happens Now?
- Your job is visible to all job seekers
- Candidates can apply directly through the platform
- You'll receive email notifications for new applications
- Review and manage applications from your dashboard

View job posting: ${FRONTEND_URL}/jobs/${jobId}

Good luck finding the perfect candidate!

Best regards,
The KaziBORA Team
    `

    return { html, text }
  },

  // Test email
  test: () => {
    const html = baseTemplate(`
      <h2>Test Email</h2>
      <p>This is a test email from KaziBORA Email Service.</p>
      <p>If you're receiving this, your email configuration is working correctly! ✅</p>
      <p>Current time: ${new Date().toLocaleString()}</p>
    `)

    const text = `
Test Email

This is a test email from KaziBORA Email Service.

If you're receiving this, your email configuration is working correctly!

Current time: ${new Date().toLocaleString()}
    `

    return { html, text }
  }
}

export default emailTemplates


