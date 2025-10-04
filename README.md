# KaziBORA Job Portal MVP

A clean, minimal job portal built with React and Supabase. This MVP includes core features for job posting and browsing, designed for easy expansion with authentication, user roles, and dashboards in future iterations.

## 🚀 Features

- **Landing Page**: Clean, attractive homepage with clear call-to-actions
- **Job Posting**: Simple form to create job listings (admin functionality)
- **Job Listings**: Browse all available jobs in a clean grid layout
- **Job Details**: View full job information with apply functionality
- **Apply System**: Multiple application methods (email, external link, or modal form)
- **📧 Email Notifications**: Automated transactional emails for applications, registrations, and job postings
- **User Authentication**: Role-based access (Admin, Employer, Job Seeker)
- **Company Profiles**: Dedicated company pages with job listings
- **Blog System**: Integrated blog for company updates and job tips

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL database)
- **Email Service**: Node.js + Express + Nodemailer
- **Routing**: React Router v6
- **Styling**: Vanilla CSS (modular, component-scoped)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## 🔧 Setup Instructions

### 1. Clone or Navigate to the Project

```bash
cd KaziBORA
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to **Settings** > **API**
3. Copy your **Project URL** and **anon/public key**
4. In the Supabase dashboard, go to **SQL Editor**
5. Copy the contents of `supabase-setup.sql` and run it in the SQL Editor

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
KaziBORA/
├── src/
│   ├── components/              # Reusable components
│   │   ├── Layout.jsx           # App layout with header/footer
│   │   ├── Layout.css
│   │   ├── JobCard.jsx          # Job listing card
│   │   ├── JobCard.css
│   │   ├── ApplyModal.jsx       # Application modal
│   │   └── ApplyModal.css
│   ├── pages/                   # Page components
│   │   ├── LandingPage.jsx      # Homepage/landing page
│   │   ├── LandingPage.css
│   │   ├── JobListingsPage.jsx  # Job listings page
│   │   ├── JobListingsPage.css
│   │   ├── JobPostPage.jsx      # Job posting form
│   │   ├── JobPostPage.css
│   │   ├── JobDetailsPage.jsx   # Individual job details
│   │   └── JobDetailsPage.css
│   ├── lib/                     # Utilities and configurations
│   │   └── supabase.js          # Supabase client setup
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # App entry point
│   └── index.css                # Global styles
├── supabase-setup.sql           # Database schema and sample data
├── package.json
├── vite.config.js
└── README.md
```

## 🗄 Database Schema

### Jobs Table

| Column      | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| id          | UUID      | Primary key (auto-generated)         |
| title       | TEXT      | Job title                            |
| company     | TEXT      | Company name                         |
| location    | TEXT      | Job location                         |
| description | TEXT      | Full job description                 |
| salary      | TEXT      | Salary range (optional)              |
| apply_link  | TEXT      | Email or URL for applications        |
| created_at  | TIMESTAMP | Auto-generated timestamp             |
| updated_at  | TIMESTAMP | Auto-updated timestamp               |

## 🎯 Usage

### Routes

- **`/`** - Landing page with hero section and features
- **`/jobs`** - Browse all job listings
- **`/jobs/:id`** - View individual job details
- **`/post-job`** - Post a new job (admin)

### Posting a Job

1. Navigate to "Post a Job" in the header
2. Fill in the job details:
   - Job Title (required)
   - Company Name (required)
   - Location (required)
   - Description (required)
   - Salary Range (optional)
   - Application Link/Email (required)
3. Click "Post Job"
4. You'll be redirected to the job listings page

### Browsing Jobs

- Click "Browse Jobs" from the landing page or navigation
- All posted jobs are displayed in a grid layout
- Each job card shows: title, company, location, brief description, and salary
- Click "View Details" to see the full job information

### Applying for Jobs

- On the job details page, click "Apply Now"
- The system will:
  - Open your email client if an email address is provided
  - Open the application URL in a new tab if a web link is provided
  - Show an application modal for other cases

## 🔒 Security Notes

**Important**: This MVP does not include authentication. The database is configured to allow public access for testing purposes.

**Before deploying to production:**

1. Set up Supabase Authentication
2. Update Row Level Security (RLS) policies to restrict:
   - Job posting to authenticated admin users only
   - Job editing/deletion to admin users only
3. Keep job reading public for the listings page

## 📧 Email Notifications (NEW!)

The portal now includes a complete email notification system:

### Features
- ✅ Welcome emails for new users
- ✅ Application confirmation emails to candidates
- ✅ Application notification emails to employers
- ✅ Job posted confirmation emails to employers
- ✅ Professional HTML + Plain text templates
- ✅ Asynchronous sending (non-blocking)
- ✅ Email logging and monitoring
- ✅ Admin-configurable settings

### Quick Setup
```bash
cd email-service
npm install
# Configure .env with SMTP credentials
npm start
```

**📚 Documentation**: See [`EMAIL_QUICK_START.md`](EMAIL_QUICK_START.md) for 5-minute setup guide or [`EMAIL_SETUP_GUIDE.md`](EMAIL_SETUP_GUIDE.md) for detailed instructions.

## 🚧 Future Enhancements

Planned features for future iterations:

- **Resume Upload**: File upload functionality for resumes/CVs
- **Search & Filters**: Advanced search by keyword, location, salary, etc.
- **SMS/Push Notifications**: Additional notification channels
- **Email Campaigns**: Newsletter functionality
- **Analytics Dashboard**: Email performance metrics
- **Advanced UI**: Enhanced design with animations and better UX

## 🤝 Contributing

This is an MVP project. Feel free to expand and customize it based on your needs.

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💡 Built With

- ⚡ Vite - Fast build tool
- ⚛️ React - UI library
- 🗄️ Supabase - Backend as a Service
- 🎨 Vanilla CSS - Clean, maintainable styling

---

**KaziBORA** - Connecting talent with opportunity 🚀

