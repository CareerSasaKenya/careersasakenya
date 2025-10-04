-- KaziBORA Email Settings Migration
-- Run this SQL in your Supabase SQL Editor to add email configuration support

-- Create email_settings table for admin configuration
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read email settings
CREATE POLICY "Admins can view email settings"
ON email_settings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only admins can update email settings
CREATE POLICY "Admins can update email settings"
ON email_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Insert default email settings
INSERT INTO email_settings (setting_key, setting_value, description) VALUES
  ('email_from_name', 'KaziBORA Job Portal', 'Sender name for outgoing emails'),
  ('email_from_address', 'noreply@kazibora.com', 'Sender email address'),
  ('email_reply_to', 'support@kazibora.com', 'Reply-to email address'),
  ('enable_welcome_emails', 'true', 'Send welcome emails to new users'),
  ('enable_application_emails', 'true', 'Send application confirmation emails'),
  ('enable_employer_notifications', 'true', 'Notify employers of new applications'),
  ('enable_job_posted_emails', 'true', 'Send job posted confirmation emails')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger to update updated_at
CREATE TRIGGER update_email_settings_updated_at 
BEFORE UPDATE ON email_settings 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create email_logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view email logs
CREATE POLICY "Admins can view email logs"
ON email_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);

-- Optional: Create function to log emails (can be called from email service)
CREATE OR REPLACE FUNCTION log_email(
  p_recipient TEXT,
  p_type TEXT,
  p_subject TEXT,
  p_status TEXT DEFAULT 'sent',
  p_error TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO email_logs (recipient_email, email_type, subject, status, error_message, metadata)
  VALUES (p_recipient, p_type, p_subject, p_status, p_error, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE email_settings IS 'Stores email configuration settings managed by admins';
COMMENT ON TABLE email_logs IS 'Logs all emails sent by the system for auditing';


