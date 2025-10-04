# Admin User Setup Instructions

## Create Admin Account: careersasa90@gmail.com

You have **two options** to create your admin account:

---

## 🚀 Option 1: Via Supabase Dashboard (RECOMMENDED - Easiest)

### Step 1: Create the User Account
1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your **KaziBORA project**
3. Navigate to **Authentication** → **Users**
4. Click **"Add user"** button
5. Fill in:
   - **Email**: `careersasa90@gmail.com`
   - **Password**: `CareerSasa12!`
   - Click **"Create user"**

### Step 2: Grant Admin Role
1. Stay in your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a **New query**
4. Copy and paste this SQL:

```sql
-- Update user to admin role
UPDATE profiles 
SET role = 'admin', 
    full_name = 'Admin User'
WHERE email = 'careersasa90@gmail.com';
```

5. Click **"Run"** to execute
6. You should see: **"Success. No rows returned"**

### Step 3: Verify & Login
1. Go to your KaziBORA website
2. Click **"Login"**
3. Enter:
   - **Email**: careersasa90@gmail.com
   - **Password**: CareerSasa12!
4. You should now have admin access! 🎉

---

## 🔧 Option 2: Via Your Application (If signup is working)

### Step 1: Sign Up Through Your App
1. Go to your KaziBORA website
2. Click **"Sign Up"**
3. Fill in the form:
   - **Full Name**: Admin User
   - **Email**: careersasa90@gmail.com
   - **Password**: CareerSasa12!
   - **Confirm Password**: CareerSasa12!
   - **Select Role**: Job Seeker (we'll change this to admin)
4. Click **"Sign Up"**

### Step 2: Grant Admin Role
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Run the script from `create-admin-user.sql`, OR paste:

```sql
UPDATE profiles 
SET role = 'admin'
WHERE email = 'careersasa90@gmail.com';
```

4. Click **"Run"**

### Step 3: Verify
1. Log out and log back in to refresh your session
2. You should now see admin features! 🎉

---

## ✅ What Admin Access Includes

Once you're an admin, you can:

- ✅ **Manage All Jobs**: Edit/delete any job posting
- ✅ **Manage All Companies**: Edit/delete any company profile  
- ✅ **Manage All Applications**: View and update all job applications
- ✅ **Manage Users**: View and potentially modify user roles
- ✅ **Full Dashboard Access**: See all system data
- ✅ **Override Permissions**: Bypass role restrictions

---

## 🔍 Verify Admin Role

To confirm your admin role is set correctly:

### Via Supabase Dashboard:
1. Go to **SQL Editor**
2. Run:
```sql
SELECT id, email, role, full_name 
FROM profiles 
WHERE email = 'careersasa90@gmail.com';
```
3. Should show: `role = 'admin'`

### Via Your Application:
1. Log in with your credentials
2. Check your user dashboard
3. You should see admin-specific features and controls

---

## ⚠️ Troubleshooting

### "User not found" error
- The user account hasn't been created yet
- Follow **Option 1, Step 1** to create the user first

### "No rows updated" when running SQL
- Check the email is correct: `careersasa90@gmail.com`
- Verify user exists in Authentication > Users
- Try: `SELECT * FROM profiles WHERE email = 'careersasa90@gmail.com';`

### Can't log in after setup
- Verify email and password are correct
- Check Supabase Dashboard > Authentication > Users
- Ensure email is confirmed (check "Confirm email" toggle in user settings)

### Admin features not showing
- Log out and log back in to refresh your session
- Clear browser cache/cookies
- Check the profile role in database (see "Verify Admin Role" above)

---

## 📝 Quick Reference

**Your Admin Credentials:**
- Email: `careersasa90@gmail.com`
- Password: `CareerSasa12!`
- Role: `admin`

**Important Files:**
- `create-admin-user.sql` - SQL script to grant admin role
- `supabase-complete-setup-FINAL.sql` - Full database schema

**Need Help?**
Check the profiles table structure:
```sql
SELECT * FROM profiles WHERE email = 'careersasa90@gmail.com';
```

