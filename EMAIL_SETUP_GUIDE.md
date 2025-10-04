# 📧 Email Notifications Setup Guide

This guide will help you set up the email notification system for KaziBORA Job Portal.

## 📋 Overview

The email notification system automatically sends emails for the following events:

1. **New User Registration** → Welcome email to the user
2. **Job Application Submitted** → Confirmation to candidate + notification to employer
3. **Job Posted** → Confirmation to employer

## 🏗️ Architecture

The email system consists of:
- **Standalone Email Service**: Node.js + Express server running separately
- **Nodemailer**: For sending emails via SMTP
- **Supabase Realtime**: Listens to database changes and triggers emails
- **Email Templates**: Professional HTML + plain text templates
- **Email Queue**: Asynchronous processing to prevent blocking

## 🚀 Setup Instructions

### Step 1: Install Email Service Dependencies

Navigate to the email service directory and install dependencies:

```bash
cd email-service
npm install
```

### Step 2: Configure SMTP Settings

1. Copy the example environment file:
   ```bash
   # Rename env.example.txt to .env
   cp env.example.txt .env
   ```

2. Edit `.env` and configure your SMTP settings.

#### Option A: Using Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Generate a new app password for "Mail"
3. Update `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-digit-app-password
   ```

#### Option B: Using SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Option C: Using Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

### Step 3: Configure Supabase Connection

In your `.env` file, add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

⚠️ **Important**: Use the **Service Role Key**, not the anon key. Find it in:
- Supabase Dashboard → Project Settings → API → Service Role Key

### Step 4: Run Database Migration

Run the email settings migration in your Supabase SQL Editor:

```bash
# Open Supabase Dashboard → SQL Editor
# Copy and run the contents of: supabase-email-settings-migration.sql
```

This creates:
- `email_settings` table for admin configuration
- `email_logs` table for tracking sent emails
- Necessary policies and triggers

### Step 5: Configure Email Branding

Update your email sender details in `.env`:

```env
EMAIL_FROM_NAME=Your Company Name
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_REPLY_TO=support@yourdomain.com
```

### Step 6: Set Frontend URL

Make sure the frontend URL is correct for email links:

```env
# Development
FRONTEND_URL=http://localhost:5173

# Production
FRONTEND_URL=https://yourapp.com
```

### Step 7: Start the Email Service

```bash
cd email-service
npm start

# Or for development with auto-reload:
npm run dev
```

You should see:
```
✅ Email service running on port 3001
✅ Environment: development
✅ Frontend URL: http://localhost:5173
✅ Realtime listeners setup complete
```

### Step 8: Test Email Functionality

Send a test email to verify everything works:

```bash
curl -X POST http://localhost:3001/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

If successful, you'll receive a test email.

## 📧 Email Types & Templates

### 1. Welcome Email
**Trigger**: New user registration  
**Recipients**: New user  
**Template**: Professional welcome message with getting started tips

### 2. Application Confirmation
**Trigger**: Candidate applies to a job  
**Recipients**: Candidate  
**Template**: Confirms application received, explains next steps

### 3. Application Notification
**Trigger**: Candidate applies to a job  
**Recipients**: Employer/Job poster  
**Template**: Notifies about new application with candidate details

### 4. Job Posted Confirmation
**Trigger**: Employer posts a new job  
**Recipients**: Employer  
**Template**: Confirms job is live with next steps

## 🔧 Configuration Options

All email features can be toggled in the `email_settings` table:

```sql
-- Disable welcome emails
UPDATE email_settings 
SET setting_value = 'false' 
WHERE setting_key = 'enable_welcome_emails';

-- Update sender name
UPDATE email_settings 
SET setting_value = 'New Company Name' 
WHERE setting_key = 'email_from_name';
```

## 🎨 Customizing Email Templates

Email templates are located in:
```
email-service/services/emailTemplates.js
```

Each template has two versions:
- **HTML**: Styled, professional layout
- **Plain Text**: Fallback for email clients that don't support HTML

To customize:
1. Open `emailTemplates.js`
2. Edit the relevant template function
3. Restart the email service
4. Test with the `/test-email` endpoint

## 🐛 Troubleshooting

### Emails not sending

1. **Check SMTP credentials**:
   ```bash
   # The service will log SMTP connection errors
   tail -f logs/email-service.log
   ```

2. **Verify Supabase connection**:
   ```bash
   curl http://localhost:3001/health
   ```

3. **Check email service logs**:
   - Look for error messages in the console
   - Verify the service is running on port 3001

### Emails going to spam

1. Configure SPF, DKIM, and DMARC records for your domain
2. Use a reputable SMTP service (SendGrid, Mailgun, etc.)
3. Avoid spam trigger words in subject lines
4. Include an unsubscribe option (for marketing emails)

### Realtime listeners not working

1. Check Supabase Realtime is enabled:
   - Supabase Dashboard → Database → Replication
   - Enable replication for `applications`, `jobs`, and `profiles` tables

2. Verify service role key has proper permissions

## 🚀 Deployment

### Option 1: Deploy Alongside Main App

Run the email service on the same server:

```bash
# Using PM2
pm2 start email-service/server.js --name "kazibora-email"
pm2 save
```

### Option 2: Deploy Separately

Deploy to a separate server or serverless platform:

- **Heroku**: Push email-service folder
- **Railway**: Connect GitHub repo, set root to `/email-service`
- **DigitalOcean App Platform**: Deploy as a separate service
- **AWS Lambda**: Convert to serverless functions

### Environment Variables for Production

Make sure to set all environment variables in your production environment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-api-key
EMAIL_FROM_NAME=KaziBORA Job Portal
EMAIL_FROM_ADDRESS=noreply@kazibora.com
EMAIL_REPLY_TO=support@kazibora.com
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourapp.com
```

## 📊 Monitoring

### View Email Logs

Query the email logs table to see sent emails:

```sql
SELECT 
  recipient_email,
  email_type,
  subject,
  status,
  created_at
FROM email_logs
ORDER BY created_at DESC
LIMIT 50;
```

### Check Failed Emails

```sql
SELECT * FROM email_logs
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## 🔒 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate SMTP credentials** regularly
4. **Use service role key** only in backend (never in frontend)
5. **Enable rate limiting** to prevent email spam
6. **Validate email addresses** before sending

## 📝 Email Settings (Admin Panel)

Future enhancement: Create an admin panel to manage email settings:

- Enable/disable specific email types
- Update sender information
- Customize email templates
- View email logs
- Test email configuration

## ⚡ Performance Tips

1. **Use email queue**: Already implemented for async processing
2. **Batch emails**: For bulk operations, send in batches
3. **Monitor sending rate**: Most SMTP providers have rate limits
4. **Cache templates**: Templates are loaded once at startup

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review email service logs
3. Test SMTP connection separately
4. Verify database permissions
5. Check Supabase Realtime is enabled

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Setup](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [Mailgun SMTP Setup](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)

---

**Need Help?** Open an issue or contact support@kazibora.com


