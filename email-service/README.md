# 📧 KaziBORA Email Service

Standalone email notification service for the KaziBORA Job Portal.

## Features

- ✅ **Automated Emails**: Triggered by database events via Supabase Realtime
- ✅ **Professional Templates**: HTML + Plain text formats
- ✅ **Asynchronous Processing**: Non-blocking email queue
- ✅ **SMTP Support**: Works with Gmail, SendGrid, Mailgun, etc.
- ✅ **Configurable**: Easy to customize sender info and templates
- ✅ **Email Logging**: Track all sent emails in database

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `env.example.txt` to `.env` and configure:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Run Database Migration

Execute `supabase-email-settings-migration.sql` in Supabase SQL Editor.

### 4. Start Service

```bash
npm start

# Development with auto-reload
npm run dev
```

## Email Types

| Event | Email Type | Recipient |
|-------|-----------|-----------|
| User Registration | Welcome Email | New User |
| Job Application | Application Confirmation | Candidate |
| Job Application | Application Notification | Employer |
| Job Posted | Job Posted Confirmation | Employer |

## API Endpoints

### Health Check
```bash
GET /health
```

### Send Test Email
```bash
POST /test-email
Content-Type: application/json

{
  "to": "test@example.com"
}
```

### Manual Email Send
```bash
POST /send-email
Content-Type: application/json

{
  "type": "welcome",
  "data": {
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "job_seeker"
  }
}
```

## Project Structure

```
email-service/
├── server.js                   # Main server & realtime listeners
├── services/
│   ├── emailService.js         # Email sending logic
│   ├── emailTemplates.js       # Email templates
│   └── emailQueue.js           # Queue processing
├── package.json
└── README.md
```

## Configuration

### SMTP Providers

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

## Deployment

### Using PM2
```bash
pm2 start server.js --name "kazibora-email"
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

### Environment Variables (Production)
- Set `NODE_ENV=production`
- Use production SMTP credentials
- Update `FRONTEND_URL` to production domain
- Secure `SUPABASE_SERVICE_KEY`

## Monitoring

Check email logs:
```sql
SELECT * FROM email_logs 
ORDER BY created_at DESC 
LIMIT 50;
```

Check failed emails:
```sql
SELECT * FROM email_logs 
WHERE status = 'failed';
```

## Troubleshooting

**Emails not sending:**
- Verify SMTP credentials
- Check firewall/network settings
- Review service logs

**Realtime not working:**
- Enable Supabase Realtime for tables
- Verify service role key permissions
- Check table replication settings

## Support

For detailed setup instructions, see `EMAIL_SETUP_GUIDE.md`

## License

MIT


