# Company Profiles - System Architecture

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│    profiles      │         │    companies     │         │      jobs        │
├──────────────────┤         ├──────────────────┤         ├──────────────────┤
│ id (PK)          │◄────┐   │ id (PK)          │◄────┐   │ id (PK)          │
│ email            │     │   │ name             │     │   │ title            │
│ full_name        │     │   │ logo_url         │     │   │ description      │
│ role             │     │   │ website          │     │   │ location         │
│ company_id (FK) ─┼─────┘   │ industry         │     └───┼─ company_id (FK) │
│ created_at       │         │ location         │         │ employer_id (FK) │
│ updated_at       │         │ size             │         │ company (text)   │
└──────────────────┘         │ description      │         │ salary           │
                             │ created_at       │         │ apply_link       │
                             │ updated_at       │         │ created_at       │
                             └──────────────────┘         └──────────────────┘

  User Profile                 Company Profile              Job Posting
  (Employer/Admin)            (One per Employer)         (Linked to Company)
```

---

## User Flow Diagrams

### Employer Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EMPLOYER WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────┘

   Login as Employer
         │
         ▼
   ┌─────────────────┐
   │   Dashboard     │
   └─────────────────┘
         │
         ▼
   Company Profile Exists?
         │
    ┌────┴────┐
    │         │
   NO        YES
    │         │
    │         ▼
    │    ┌──────────────────┐
    │    │ View/Edit Jobs   │
    │    │ Manage Company   │
    │    └──────────────────┘
    │         │
    │         ▼
    │    Post New Job
    │         │
    │         ▼
    │    ┌──────────────────┐
    │    │ Auto-linked to   │
    │    │ Your Company     │
    │    └──────────────────┘
    │
    ▼
┌──────────────────────┐
│ Create Company       │
│ Profile First        │
│ (Required)           │
└──────────────────────┘
    │
    ▼
Fill Company Details
    │
    ▼
Submit & Link to Profile
    │
    ▼
Now Can Post Jobs
```

### Admin Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ADMIN WORKFLOW                              │
└─────────────────────────────────────────────────────────────────────┘

   Login as Admin
         │
         ▼
   ┌─────────────────┐
   │ Admin Dashboard │
   └─────────────────┘
         │
         ▼
   Post New Job
         │
         ▼
   ┌─────────────────────────────────────┐
   │ Link to Company? (Optional)         │
   └─────────────────────────────────────┘
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    │         ▼
    │    ┌──────────────────────┐
    │    │ Manual Company Name? │
    │    └──────────────────────┘
    │         │
    │    ┌────┴────┐
    │    │         │
    │   YES        NO
    │    │         │
    │    │         ▼
    │    │    ┌────────────────┐
    │    │    │ Posted by      │
    │    │    │ Admin Label    │
    │    │    └────────────────┘
    │    │
    │    ▼
    │    Manual Text Entry
    │
    ▼
Select Company from Dropdown
    │
    ▼
Job Linked to Company Profile
```

### Job Seeker Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       JOB SEEKER WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────┘

   Browse Jobs
         │
         ▼
   ┌──────────────────┐
   │ Job Card Shows:  │
   │ - Company Logo   │
   │ - Company Name   │
   │   (Clickable)    │
   └──────────────────┘
         │
    ┌────┴────┐
    │         │
Click Job    Click Company
    │         │
    │         ▼
    │    ┌──────────────────┐
    │    │ Company Profile  │
    │    │ - Logo & Info    │
    │    │ - Description    │
    │    │ - All Open Jobs  │
    │    └──────────────────┘
    │         │
    │         ▼
    │    Browse Company Jobs
    │
    ▼
┌──────────────────┐
│ Job Details:     │
│ - Company Info   │
│ - Company Link   │
│ - Description    │
│ - Apply Button   │
└──────────────────┘
    │
    ▼
Apply to Job
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                             │
└─────────────────────────────────────────────────────────────────────┘

App.jsx (Routes)
│
├─ /companies/:id
│  └─ CompanyProfilePage
│     ├─ Company Header (logo, info)
│     ├─ Company About
│     └─ Jobs Grid
│        └─ JobCard (multiple)
│
├─ /jobs/:id
│  └─ JobDetailsPage
│     ├─ Job Header
│     ├─ Company Section ◄─── NEW
│     │  ├─ Logo
│     │  ├─ Name (clickable)
│     │  └─ Location
│     ├─ Company About (if available)
│     └─ Job Description
│
├─ /jobs
│  └─ JobListingsPage
│     └─ JobCard Grid
│        └─ JobCard ◄─── UPDATED
│           ├─ Job Title
│           ├─ Company Info ◄─── NEW
│           │  ├─ Logo
│           │  └─ Name (clickable)
│           └─ Job Details
│
├─ /dashboard (Employer)
│  └─ EmployerDashboard ◄─── UPDATED
│     ├─ Tabs
│     │  ├─ Jobs Tab
│     │  └─ Company Tab ◄─── NEW
│     └─ Company Management ◄─── NEW
│        ├─ CompanyForm
│        └─ Company View
│
└─ /post-job
   └─ JobPostPage ◄─── UPDATED
      ├─ Company Info (Employer) ◄─── NEW
      ├─ Company Select (Admin) ◄─── NEW
      └─ Job Form
```

---

## Data Flow

### Creating a Company (Employer)

```
User Action                 Frontend                    Backend (Supabase)
    │                           │                              │
    ▼                           │                              │
Fill Company Form               │                              │
    │                           │                              │
    ▼                           │                              │
Click Submit ──────────────────►│                              │
    │                     CompanyForm                          │
    │                           │                              │
    │                           ▼                              │
    │                     POST /companies ────────────────────►│
    │                           │                         companies.insert()
    │                           │                              │
    │                           │                              ▼
    │                           │                         Return company.id
    │                           │◄─────────────────────────────┤
    │                           │                              │
    │                           ▼                              │
    │                     UPDATE profiles ─────────────────────►│
    │                     set company_id              profiles.update()
    │                           │                              │
    │                           │◄─────────────────────────────┤
    │                           │                              │
    │                           ▼                              │
    │◄────────────────── Success Message                       │
    │                           │                              │
    ▼                           │                              │
Company Profile Created         │                              │
```

### Posting a Job (Employer)

```
User Action                 Frontend                    Backend (Supabase)
    │                           │                              │
    ▼                           │                              │
Fill Job Form                   │                              │
    │                           │                              │
    ▼                           │                              │
Click Submit ──────────────────►│                              │
    │                     JobPostPage                          │
    │                           │                              │
    │                           ▼                              │
    │                     Get User's Company                   │
    │                           │                              │
    │                           ▼                              │
    │                     POST /jobs ──────────────────────────►│
    │                     {                               jobs.insert()
    │                       ...jobData,                         │
    │                       company_id: userCompany.id,         │
    │                       company: userCompany.name           │
    │                     }                                     │
    │                           │                              │
    │                           │◄─────────────────────────────┤
    │◄────────────────── Success                               │
    │                           │                              │
    ▼                           │                              │
Job Posted (Linked to Company)  │                              │
```

### Viewing Jobs with Company Info

```
User Action                 Frontend                    Backend (Supabase)
    │                           │                              │
    ▼                           │                              │
View Job Listings               │                              │
    │                           │                              │
    ▼                           │                              │
Page Loads ────────────────────►│                              │
    │                      JobCard                             │
    │                           │                              │
    │                           ▼                              │
    │                     GET /jobs ───────────────────────────►│
    │                           │                         jobs.select()
    │                           │◄─────────────────────────────┤
    │                           │                              │
    │                           ▼                              │
    │                    For each job with company_id:         │
    │                           │                              │
    │                           ▼                              │
    │                     GET /companies ──────────────────────►│
    │                           │                      companies.select()
    │                           │◄─────────────────────────────┤
    │                           │                              │
    │                           ▼                              │
    │◄────────────────── Display:                              │
    │                    - Job Info                            │
    │                    - Company Logo                        │
    │                    - Company Name (clickable)            │
    ▼                           │                              │
See Jobs with Companies         │                              │
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ROW LEVEL SECURITY (RLS)                          │
└─────────────────────────────────────────────────────────────────────┘

Companies Table
├─ SELECT: Everyone (public profiles)
├─ INSERT: Employers only
├─ UPDATE: Own company OR Admin
└─ DELETE: Own company OR Admin

Jobs Table (Updated)
├─ SELECT: Everyone (public jobs)
├─ INSERT: Employer (with company_id) OR Admin (optional company_id)
├─ UPDATE: Own jobs OR Admin
└─ DELETE: Own jobs OR Admin

Profiles Table (Updated)
├─ SELECT: Everyone (public profiles)
├─ INSERT: Self only
├─ UPDATE: Self OR Admin
└─ DELETE: Self OR Admin
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION DIAGRAM                               │
└─────────────────────────────────────────────────────────────────────┘

   JobCard Component
         │
         ├─► Fetches Company (if company_id exists)
         │
         └─► Links to /companies/:id
                    │
                    ▼
            CompanyProfilePage
                    │
                    ├─► Displays Company Info
                    │
                    └─► Lists Company's Jobs
                              │
                              ▼
                        Uses JobCard Component
                              │
                              └─► (Recursive display)

   JobDetailsPage
         │
         ├─► Fetches Job Data
         │
         ├─► If job.company_id exists:
         │   └─► Fetches Company Data
         │       └─► Displays Company Section
         │           └─► Links to Company Profile
         │
         └─► If no company_id:
             └─► Shows "Posted by Admin"
```

---

## File Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DEPENDENCY GRAPH                                │
└─────────────────────────────────────────────────────────────────────┘

App.jsx
 ├─► CompanyProfilePage
 │    ├─► JobCard
 │    │    ├─► supabase (company data)
 │    │    └─► useNavigate
 │    └─► supabase (jobs query)
 │
 ├─► EmployerDashboard
 │    ├─► CompanyForm
 │    │    ├─► supabase (companies CRUD)
 │    │    └─► useAuth
 │    └─► supabase (company query)
 │
 ├─► JobPostPage
 │    ├─► supabase (companies query)
 │    └─► useAuth (role check)
 │
 ├─► JobCard (updated)
 │    ├─► supabase (company query)
 │    └─► useNavigate
 │
 └─► JobDetailsPage (updated)
      ├─► supabase (company query)
      └─► useNavigate
```

---

## Summary

- **3 Core Entities:** Profiles → Companies → Jobs
- **4 User Roles:** Job Seeker, Employer, Admin, Anonymous
- **2 Display Modes:** With Company / Without Company (Admin)
- **1 Public Route:** `/companies/:id`
- **Multiple Integration Points:** JobCard, JobDetails, Dashboard

This architecture ensures:
- ✅ Flexibility for Admins
- ✅ Required structure for Employers  
- ✅ Public company discovery for Job Seekers
- ✅ Clean separation of concerns
- ✅ Backward compatibility


