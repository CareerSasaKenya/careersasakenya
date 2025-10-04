# 🚀 Quick Start Guide - KaziBORA with Authentication

## Step 1: Update Database (5 minutes)

1. Open your Supabase project: https://supabase.com/dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the **entire** contents of `supabase-setup.sql`
5. Paste and click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" ✅

## Step 2: Start the App (1 minute)

```bash
npm run dev
```

Your app should now be running at http://localhost:5173

## Step 3: Create Your First Users (3 minutes)

### Create a Job Seeker Account
1. Click **Sign Up** in the navigation
2. Fill in:
   - Full Name: `John Doe`
   - Email: `jobseeker@test.com`
   - Role: **Job Seeker**
   - Password: `test123`
3. Click **Sign Up**
4. You'll be redirected to the Job Seeker Dashboard ✅

### Create an Employer Account
1. Click **Logout** → **Sign Up**
2. Fill in:
   - Full Name: `Jane Smith`
   - Email: `employer@test.com`
   - Role: **Employer**
   - Company: `TechCorp Kenya`
   - Password: `test123`
3. Click **Sign Up**
4. You'll be redirected to the Employer Dashboard ✅

### Create an Admin Account
1. First sign up normally:
   - Email: `admin@test.com`
   - Role: Job Seeker (we'll change this)
   - Password: `test123`

2. Go to Supabase → **SQL Editor** → Run this:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'admin@test.com';
   ```

3. Logout and login again as admin
4. You'll see the Admin Dashboard ✅

## Step 4: Test the Features (5 minutes)

### As Employer:
1. Login as `employer@test.com`
2. Click **Post Job** in navigation
3. Fill in job details and submit
4. Go to **Dashboard** to see your posted job
5. Try editing or deleting it

### As Job Seeker:
1. Login as `jobseeker@test.com`
2. Click **Browse Jobs**
3. Click on a job → Click **☆ Save** to bookmark it
4. Click **Apply Now** → Fill cover letter → Submit
5. Go to **Dashboard**:
   - See your application in the Applications tab
   - See saved job in Saved Jobs tab

### As Admin:
1. Login as `admin@test.com`
2. Go to **Dashboard**
3. **All Jobs Tab:**
   - See all jobs in the system
   - Edit or delete any job
4. **All Users Tab:**
   - See all registered users
   - Try changing a user's role using the dropdown

## 🎉 You're Done!

Your job portal now has:
- ✅ User authentication (sign up, login, logout)
- ✅ Three user roles (Job Seeker, Employer, Admin)
- ✅ Role-specific dashboards
- ✅ Job application system
- ✅ Bookmark/save jobs
- ✅ Secure data access
- ✅ User management

## 🐛 Troubleshooting

**Problem: "Failed to post job"**
- Make sure you're logged in as Employer or Admin
- Check browser console for errors

**Problem: "Cannot apply to job"**
- You must be logged in as Job Seeker
- Make sure you haven't already applied

**Problem: No dashboard showing**
- Clear browser cache and reload
- Check if you're logged in
- Verify profile role in Supabase: `SELECT * FROM profiles`

**Problem: SQL errors when running supabase-setup.sql**
- Make sure to run the entire script, not in parts
- If tables already exist, you may need to drop them first:
  ```sql
  DROP TABLE IF EXISTS bookmarks CASCADE;
  DROP TABLE IF EXISTS applications CASCADE;
  DROP TABLE IF EXISTS jobs CASCADE;
  DROP TABLE IF EXISTS profiles CASCADE;
  ```
  Then run the full `supabase-setup.sql` again

## 📚 What's Next?

Check out these files for more info:
- `AUTH_SETUP_GUIDE.md` - Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list
- `README.md` - Original project documentation

## 🎯 Test Accounts Summary

For easy reference:

| Role | Email | Password |
|------|-------|----------|
| Job Seeker | jobseeker@test.com | test123 |
| Employer | employer@test.com | test123 |
| Admin | admin@test.com | test123 |

**Remember:** Change the admin account by running the UPDATE query in Supabase!

---

**Enjoy your new authenticated job portal!** 🎊

