# 📧 Email Notifications - Quick Start

Get the email notification system running in 5 minutes!

## 🚀 Super Quick Setup

### 1. Install Dependencies (30 seconds)

```bash
cd email-service
npm install
```

### 2. Configure Environment (2 minutes)

Create `.env` file in `email-service/` folder:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Gmail (easiest for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# Email Info
EMAIL_FROM_NAME=KaziBORA Job Portal
EMAIL_FROM_ADDRESS=noreply@kazibora.com
EMAIL_REPLY_TO=support@kazibora.com

# Other
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Where to get these values:**

- **SUPABASE_URL**: Supabase Dashboard → Project Settings → API → Project URL
- **SUPABASE_SERVICE_KEY**: Supabase Dashboard → Project Settings → API → Service Role Key (not anon!)
- **Gmail App Password**: [Generate here](https://support.google.com/accounts/answer/185833) (requires 2FA enabled)

### 3. Run Database Migration (1 minute)

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-email-settings-migration.sql`
3. Paste and click "Run"

### 4. Start Email Service (10 seconds)

```bash
npm start
```

You should see:
```
✅ Email service running on port 3001
✅ Realtime listeners setup complete
```

### 5. Test It! (30 seconds)

Send a test email:

```bash
curl -X POST http://localhost:3001/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

Check your inbox! 📬

## ✨ What Works Now

1. **New User Signs Up** → Automatic welcome email
2. **Candidate Applies** → Confirmation to candidate + notification to employer
3. **Employer Posts Job** → Confirmation email
4. **All emails logged** in database for tracking

## 🎯 Test the Full Flow

### Test User Registration Email

1. Open your app: `http://localhost:5173`
2. Sign up as a new user
3. Check your email → should receive welcome email

### Test Job Application Emails

1. Login as job seeker
2. Apply to any job
3. Check your email → should receive application confirmation
4. Login as employer → should receive notification email

### Test Job Posted Email

1. Login as employer
2. Post a new job
3. Check your email → should receive job posted confirmation

## 🔍 Check Email Logs

View sent emails in Supabase:

```sql
SELECT 
  recipient_email,
  email_type,
  subject,
  status,
  created_at
FROM email_logs
ORDER BY created_at DESC;
```

## 🚨 Troubleshooting

### Emails not sending?

1. **Check service is running**: 
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verify Gmail app password**:
   - Must have 2FA enabled on Google account
   - Generate app password from Google Account settings
   - Use the 16-digit code (no spaces)

3. **Check Supabase Realtime**:
   - Supabase Dashboard → Database → Replication
   - Enable for `profiles`, `jobs`, `applications` tables

4. **View service logs**: Check terminal where email service is running

### Still not working?

See detailed troubleshooting in `EMAIL_SETUP_GUIDE.md`

## 📧 Using Different Email Providers

### SendGrid (Recommended for Production)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

[Get SendGrid API Key](https://sendgrid.com/docs/ui/account-and-settings/api-keys/)

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

[Get Mailgun Credentials](https://www.mailgun.com/)

## 🎨 Customize Email Templates

Edit `email-service/services/emailTemplates.js` to customize:
- Email content
- Design/styling
- Links and buttons
- Footer text

Restart service after changes: `npm start`

## 🚀 Deploy to Production

1. **Set production env vars** (same as above, but with production values)
2. **Update FRONTEND_URL** to your production domain
3. **Use production SMTP credentials**
4. **Deploy email service**:
   ```bash
   # Option 1: PM2
   pm2 start email-service/server.js --name "kazibora-email"
   
   # Option 2: Docker
   cd email-service && docker build -t kazibora-email .
   
   # Option 3: Deploy to Heroku/Railway/DigitalOcean
   ```

## 📚 Full Documentation

- **Detailed Setup**: `EMAIL_SETUP_GUIDE.md`
- **Implementation Details**: `EMAIL_IMPLEMENTATION_SUMMARY.md`
- **Email Service README**: `email-service/README.md`

## ✅ That's It!

Your email notification system is now running! 🎉

All emails are sent automatically when:
- Users register
- Candidates apply to jobs
- Employers post jobs

No additional code changes needed in your React app!

---

**Questions?** Check `EMAIL_SETUP_GUIDE.md` or open an issue.


