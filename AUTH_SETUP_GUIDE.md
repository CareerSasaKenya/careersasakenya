# KaziBORA Authentication Setup Guide

This guide will help you set up authentication and user roles for the KaziBORA job portal.

## 🚀 Quick Setup

### Step 1: Update Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click **Run** to execute the SQL

This will:
- Create the `profiles`, `jobs`, `applications`, and `bookmarks` tables
- Set up Row Level Security (RLS) policies
- Create automatic profile creation trigger
- Configure proper authorization rules

### Step 2: Verify Your Environment Variables

Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Start the Development Server

```bash
npm run dev
```

## 👥 User Roles

The system supports three user roles:

### 1. **Job Seeker** (Default)
- Browse and search jobs
- Apply to jobs
- Save/bookmark jobs
- View application status in dashboard
- Manage saved jobs

### 2. **Employer**
- Post new jobs
- Edit and delete own jobs
- View applications to their jobs (future feature)
- Manage job postings from dashboard

### 3. **Admin**
- Full access to all features
- Post, edit, and delete any job
- Manage all users
- View all applications
- Change user roles

## 🔐 Authentication Features

### Sign Up
- Users can register as either Job Seeker or Employer
- Email and password authentication
- Automatic profile creation
- Company name for employers

### Login
- Email and password authentication
- Redirects to role-specific dashboard
- Session management with Supabase Auth

### Authorization
- Protected routes based on user roles
- Role-specific navigation
- Secure API access with RLS policies

## 📊 Dashboards

### Job Seeker Dashboard
- **Applications Tab**: View all submitted applications with status
- **Saved Jobs Tab**: Manage bookmarked jobs
- Quick stats: Total applications, saved jobs

### Employer Dashboard
- View all posted jobs
- Quick actions: Edit, Delete
- "Add New Job" button
- Job statistics

### Admin Dashboard
- **All Jobs Tab**: Manage all job postings
- **All Users Tab**: View and manage users
  - Change user roles
  - View user details
- System-wide statistics

## 🎯 Key Features

### Job Application System
- In-app application submission
- Cover letter and resume URL
- Track application status
- Prevent duplicate applications

### Bookmark System
- Save jobs for later
- Quick access from dashboard
- One-click bookmark toggle

### Job Management
- Create and edit jobs
- Delete own jobs (employers)
- Full management for admins

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Employers can only manage their jobs
   - Admins have full access

2. **Password Security**
   - Passwords are hashed by Supabase Auth
   - Secure session management
   - JWT-based authentication

3. **Authorization Checks**
   - Frontend route protection
   - Backend RLS policies
   - Role-based access control

## 🧪 Testing the System

### Create Test Users

1. **Create an Admin User:**
   ```sql
   -- First sign up normally, then update the profile:
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```

2. **Create Employer:**
   - Sign up and select "Employer"
   - Provide company name

3. **Create Job Seeker:**
   - Sign up and select "Job Seeker"
   - Start browsing jobs

### Test Workflows

1. **As Employer:**
   - Login → Dashboard → Post Job
   - Edit or delete your jobs
   - View job statistics

2. **As Job Seeker:**
   - Login → Browse Jobs → Apply
   - Bookmark jobs
   - Check dashboard for applications

3. **As Admin:**
   - Login → Admin Dashboard
   - Manage all jobs and users
   - Change user roles
   - Post jobs on behalf of any company

## 📝 Database Schema

### Tables

1. **profiles**
   - User profile information
   - Role assignment
   - Company name (for employers)

2. **jobs**
   - Job postings
   - Linked to employer via `employer_id`

3. **applications**
   - Job applications
   - Status tracking
   - Cover letter and resume

4. **bookmarks**
   - Saved jobs
   - One bookmark per job per user

## 🛠️ Troubleshooting

### Issue: "Failed to post job"
- Check if user has employer or admin role
- Verify RLS policies are created

### Issue: "Cannot apply to job"
- Ensure user is logged in as job seeker
- Check if already applied

### Issue: "No dashboard access"
- Verify user is authenticated
- Check profile role in database

### Issue: "Profile not created"
- Check if the trigger `on_auth_user_created` exists
- Manually insert profile if needed

## 🚀 Next Steps

To further enhance the system, consider:

1. **Email Notifications**
   - Application confirmations
   - Status updates

2. **File Uploads**
   - Resume file uploads to Supabase Storage
   - Company logos

3. **Advanced Search**
   - Filters by location, salary, company
   - Full-text search

4. **Application Management**
   - Employer can review applications
   - Update application status
   - Communication system

5. **Analytics**
   - Application conversion rates
   - Popular job categories
   - User engagement metrics

## 📞 Support

For issues or questions:
1. Check the Supabase console for errors
2. Review browser console for frontend errors
3. Verify RLS policies in Supabase dashboard
4. Check authentication state in browser DevTools

---

**Built with:** React, Vite, Supabase, React Router

