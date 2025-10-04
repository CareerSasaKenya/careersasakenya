# Company Profiles Feature - Implementation Guide

## Overview

The Company Profiles feature extends the KaziBORA job portal by adding structured company profiles linked to Employers, while maintaining Admin flexibility to post jobs with or without company associations.

## What's New

### 1. **Company Profiles**
- Full company profiles with logo, website, industry, location, size, and description
- Each Employer user is linked to exactly one company profile
- Admin users are NOT required to have a company profile

### 2. **Employer Dashboard Enhancements**
- New "Company Profile" tab in the Employer Dashboard
- Create and edit company profile directly from the dashboard
- Visual indication when company profile is missing
- Employers must create a company profile before posting jobs

### 3. **Public Company Pages**
- Public-facing company profile pages at `/companies/:id`
- Display company information, logo, and description
- List all open jobs posted by that company
- Each job card links back to its company's page

### 4. **Job Posting Rules**

#### For Employers:
- **Must** have a company profile before posting jobs
- All jobs are automatically linked to their company profile
- Cannot post jobs without a company

#### For Admins:
- **Flexible** posting options:
  - Option A: Attach job to an existing company profile
  - Option B: Post without a company (shows "Posted by Admin")
  - Can optionally enter a company name for direct posts

### 5. **Job Listings Integration**
- Job cards display company logo and name (if available)
- Company name is clickable and links to company profile
- Jobs without a company show "Posted by Admin" with a generic label
- Job details page includes company information section

---

## Setup Instructions

### Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-companies-migration.sql`
4. Click **Run** to execute the migration

This will:
- Create the `companies` table
- Add `company_id` column to `profiles` and `jobs` tables
- Set up Row Level Security policies
- Make the `company` field in `jobs` optional (for backward compatibility)

### Step 2: Test the Application

No additional frontend setup is required. The feature is ready to use!

---

## Database Schema

### New Tables

#### `companies` Table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  industry TEXT,
  location TEXT,
  size TEXT,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Updated Tables

#### `profiles` Table
- **New Column:** `company_id` (UUID, optional) - Links Employer to their company

#### `jobs` Table
- **New Column:** `company_id` (UUID, optional) - Links job to a company
- **Modified:** `company` field is now optional (nullable)

---

## Feature Walkthrough

### For Employers

1. **First Time Setup:**
   - Log in to your Employer account
   - Navigate to Dashboard
   - You'll see a prompt: "Please create your company profile to get started"
   - Click on the "Company Profile" tab
   - Fill in your company details and submit

2. **Posting Jobs:**
   - Once your company profile is created, click "Add New Job"
   - The job will automatically be linked to your company
   - You'll see a confirmation: "✓ This job will be posted under [Your Company Name]"

3. **Managing Company Profile:**
   - Go to Dashboard → Company Profile tab
   - Click "Edit Profile" to update your company information
   - View how your company appears to job seekers

### For Admins

1. **Posting Jobs with Company:**
   - Click "Post a New Job"
   - Select a company from the "Link to Company" dropdown
   - The job will be associated with that company

2. **Posting Jobs without Company:**
   - Click "Post a New Job"
   - Select "No company (Admin direct post)" from the dropdown
   - Optionally enter a company name in the text field
   - The job will show "Posted by Admin" on listings

### For Job Seekers

1. **Browsing Jobs:**
   - View jobs with company logos and names
   - Click on company names to view their full profile
   - See all open positions from a specific company

2. **Company Profiles:**
   - Browse company information, industry, and location
   - Read company descriptions
   - Visit company websites
   - View all open positions from that company

---

## API / Database Queries

### Fetch Company Profile
```javascript
const { data, error } = await supabase
  .from('companies')
  .select('*')
  .eq('id', companyId)
  .single()
```

### Fetch Jobs by Company
```javascript
const { data, error } = await supabase
  .from('jobs')
  .select('*')
  .eq('company_id', companyId)
  .order('created_at', { ascending: false })
```

### Create Company Profile
```javascript
const { data, error } = await supabase
  .from('companies')
  .insert([{
    name: 'Company Name',
    logo_url: 'https://...',
    website: 'https://...',
    industry: 'Technology',
    location: 'Nairobi, Kenya',
    size: '11-50',
    description: 'About the company...'
  }])
  .select()
  .single()

// Link to employer profile
await supabase
  .from('profiles')
  .update({ company_id: newCompany.id })
  .eq('id', employerId)
```

---

## File Structure

### New Files Created

```
src/
├── components/
│   ├── CompanyForm.jsx          # Company profile form
│   └── CompanyForm.css          # Form styling
├── pages/
│   ├── CompanyProfilePage.jsx   # Public company profile page
│   └── CompanyProfilePage.css   # Company page styling

supabase-companies-migration.sql  # Database migration script
COMPANY_PROFILES_GUIDE.md         # This guide
```

### Modified Files

```
src/
├── App.jsx                       # Added company profile route
├── components/
│   ├── JobCard.jsx              # Display company logo/name
│   └── JobCard.css              # Company display styles
├── pages/
│   ├── EmployerDashboard.jsx    # Added company management tab
│   ├── JobPostPage.jsx          # Company linking for jobs
│   ├── JobDetailsPage.jsx       # Display company info
│   ├── JobDetailsPage.css       # Company section styles
│   └── Dashboard.css            # Tab and company styles
```

---

## Security & Permissions

### Row Level Security Policies

#### Companies Table
- **SELECT:** Anyone can view companies (public)
- **INSERT:** Employers can create companies
- **UPDATE:** Employers can update their own company, Admins can update any
- **DELETE:** Employers can delete their own company, Admins can delete any

#### Updated Policies
- Jobs can now have `company_id = NULL` (for Admin direct posts)
- Employer jobs require `company_id` to match their profile's company

---

## Backward Compatibility

The migration is designed to be **backward compatible**:

1. Existing jobs without `company_id` will continue to work
2. The `company` text field is now optional, so old jobs with company names remain valid
3. Employers can gradually create company profiles
4. No data loss or breaking changes

---

## UI/UX Features

### Clean & Minimal Design
- Professional company profile cards
- Responsive layout for mobile and desktop
- Smooth transitions and hover effects
- Clear visual hierarchy

### User Experience
- Intuitive tab-based navigation in dashboards
- Clear feedback messages for required actions
- Clickable company names throughout the app
- Visual indicators for Admin-posted jobs

---

## Testing Checklist

### As an Employer:
- [ ] Create a company profile
- [ ] Edit company profile
- [ ] Post a job (should auto-link to company)
- [ ] View your company's public profile
- [ ] Verify job cards show your company logo

### As an Admin:
- [ ] Post a job with a company link
- [ ] Post a job without a company
- [ ] Post a job with a manual company name
- [ ] Edit jobs with and without companies

### As a Job Seeker:
- [ ] Browse jobs with company information
- [ ] Click on a company name to view their profile
- [ ] View all jobs from a specific company
- [ ] Apply to jobs from company profiles

---

## Troubleshooting

### Issue: Employer can't post jobs
**Solution:** Ensure the employer has created their company profile first.

### Issue: Company logo not displaying
**Solution:** Verify the `logo_url` is a valid, publicly accessible image URL.

### Issue: "Posted by Admin" not showing
**Solution:** Check that the job has `company_id = NULL` and `company = NULL`.

### Issue: RLS errors when creating company
**Solution:** Verify the user's role is set to 'employer' in the profiles table.

---

## Future Enhancements

Potential features to add:
- Company followers/watchlist
- Company reviews and ratings
- Employee count and team showcase
- Company culture and benefits section
- Social media links
- Company blog integration
- Analytics for company profile views

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the database migration script
3. Verify Supabase RLS policies are active
4. Check browser console for errors

---

**Version:** 1.0  
**Last Updated:** October 2, 2025  
**Compatible with:** KaziBORA Job Portal v2.0+


