# Admin Dashboard - Blog Management Guide

## Overview

The Admin Dashboard has been enhanced with comprehensive blog management features, allowing administrators to manage all blog posts from a centralized location.

---

## 🎯 Accessing Blog Management

1. Log in as an admin user
2. Navigate to **Dashboard** (click "Dashboard" in the navigation)
3. Click the **"Blog Posts"** tab

---

## 📊 Dashboard Stats

The dashboard header displays key statistics:

- **Total Jobs** - Number of job postings
- **Total Users** - Number of registered users
- **Published Posts** - Number of published blog posts
- **Draft Posts** - Number of draft blog posts

---

## 📝 Blog Posts Table

The Blog Posts tab shows all blog posts in a comprehensive table:

| Column | Description |
|--------|-------------|
| **Title** | Blog post title (clickable if published) |
| **Author** | Name of the admin who created the post |
| **Category** | Post category (e.g., "Career Advice") |
| **Status** | Badge showing "draft" or "published" |
| **Published** | Publication date (or "-" for drafts) |
| **Actions** | Publish/Unpublish, Edit, Delete buttons |

---

## ✨ Key Features

### 1. Quick Status Toggle

**Publish a Draft:**
- Click the green **"Publish"** button
- Post immediately becomes visible to the public
- Published date is automatically set
- Status badge changes to "published"

**Unpublish a Post:**
- Click the orange **"Unpublish"** button
- Post becomes hidden from public view
- Published date is cleared
- Status badge changes to "draft"

**Benefits:**
- No need to open the edit form
- Instant status change
- Perfect for temporarily hiding content

### 2. Edit Posts

- Click the **"Edit"** button next to any post
- Opens the full blog post editor
- Make changes to any field
- Save updates or delete the post

### 3. Delete Posts

- Click the **"Delete"** button
- Confirmation dialog appears
- Post is permanently removed
- Cannot be undone (use with caution!)

### 4. View Published Posts

- Published post titles are **clickable links**
- Click the title to view the post as it appears to public users
- Draft post titles are plain text (not clickable)

---

## 🎨 Visual Indicators

### Status Badges

**Draft** (Gray)
- Post is not visible to the public
- Can be edited and published later

**Published** (Green)
- Post is visible to everyone
- Appears in blog listing and search results

### Action Buttons

**Publish** (Green button)
- Makes a draft post public
- Sets published date to current time

**Unpublish** (Orange button)
- Hides a published post from public view
- Reverts to draft status

**Edit** (Gray button)
- Opens the post editor
- Allows full content modification

**Delete** (Red button)
- Permanently removes the post
- Requires confirmation

---

## 📋 Common Workflows

### Creating a New Post

1. From Dashboard header, click **"+ Create Blog Post"**
2. Fill in the form with your content
3. Choose "Draft" to save for later, or "Published" to publish immediately
4. Click "Create Post"
5. Post appears in the Blog Posts table

### Publishing a Draft

**Quick Method (Recommended):**
1. Go to Dashboard → Blog Posts tab
2. Find your draft post
3. Click the green **"Publish"** button
4. Done! Post is now live

**Edit Method:**
1. Click "Edit" on the draft post
2. Change Status dropdown to "Published"
3. Click "Update Post"

### Updating a Published Post

1. Find the post in the Blog Posts table
2. Click **"Edit"**
3. Make your changes
4. Click "Update Post"
5. Changes appear immediately

### Temporarily Hiding a Post

1. Find the published post in the table
2. Click the orange **"Unpublish"** button
3. Post is now hidden from public view
4. Can be republished anytime with the "Publish" button

### Scheduling Content

While there's no automatic scheduling, you can:
1. Create posts as **drafts**
2. Keep them in draft status until ready
3. Use the quick **Publish** button when it's time to go live

---

## 🔍 Filtering & Organization

### Viewing Options

- **All Posts**: Table shows both drafts and published posts
- **Status Badges**: Quickly identify draft vs published posts
- **Sorted by Date**: Newest posts appear first
- **Author Info**: See who created each post

### Post Categories

- Categories appear in the table for easy reference
- Filter by category in the public blog listing
- Useful for organizing content themes

---

## 💡 Best Practices

### Content Organization

1. **Use Drafts Liberally**: Create posts as drafts while working on them
2. **Quick Publish**: Use the dashboard toggle for fast publishing
3. **Review Before Publishing**: Click the title to preview published posts
4. **Categorize Consistently**: Use standard category names
5. **Tag Appropriately**: Add relevant tags for better discoverability

### Content Management

1. **Regular Reviews**: Check the dashboard for draft posts that need completion
2. **Update Popular Posts**: Edit and refresh popular content periodically
3. **Archive Old Content**: Unpublish outdated posts rather than deleting them
4. **Monitor Stats**: Keep track of published vs draft counts

### Team Coordination

1. **Author Attribution**: Author names are displayed for accountability
2. **Draft Workflow**: Create drafts for review before publishing
3. **Quick Changes**: Use the dashboard for fast status updates
4. **Communication**: Coordinate who's working on which drafts

---

## 🚀 Quick Actions Reference

| I want to... | Action |
|--------------|--------|
| Create a new blog post | Click "+ Create Blog Post" button |
| Publish a draft instantly | Click green "Publish" button |
| Hide a published post | Click orange "Unpublish" button |
| Edit post content | Click "Edit" button |
| View a published post | Click the post title link |
| Delete a post permanently | Click "Delete" button → Confirm |
| See all drafts | Look for gray "draft" badges |
| See all published posts | Look for green "published" badges |
| Check blog statistics | View stat cards at top of dashboard |

---

## 🔐 Security Notes

- Only **admin users** can access blog management features
- The "Blog Posts" tab only appears for admins
- Non-admin users cannot see draft posts
- RLS policies protect draft content

---

## 📱 Mobile Responsive

The dashboard is fully responsive:
- Table scrolls horizontally on small screens
- Action buttons remain accessible
- Status badges stay visible
- Stats cards stack on mobile

---

## ⚠️ Important Notes

### Publishing

- Publishing sets the `published_at` timestamp automatically
- Unpublishing clears the `published_at` timestamp
- Posts are sorted by creation date, not publication date

### Deleting

- **Deletion is permanent** - cannot be undone
- Consider unpublishing instead of deleting
- Confirm carefully before deleting

### Status Changes

- Status changes are **instant** - no page reload needed
- Changes update in the table immediately
- Public listing updates automatically

---

## 🎯 Tips for Efficient Management

1. **Batch Processing**: Handle multiple drafts in one session
2. **Quick Toggle**: Use Publish/Unpublish for fast status changes
3. **Direct Navigation**: Use the dashboard as your central hub
4. **Monitor Drafts**: Regularly check for incomplete drafts
5. **Preview Published**: Click titles to see how posts look to users

---

## 📊 Dashboard Navigation

### Three Tabs Available:

1. **All Jobs** - Manage job postings
2. **Blog Posts** - Manage blog content (★ You are here)
3. **All Users** - Manage user roles

Switch between tabs to manage different aspects of the platform.

---

## ✅ Feature Checklist

Admin Dashboard Blog Management includes:

- ✅ View all blog posts in one table
- ✅ See both drafts and published posts
- ✅ Quick publish/unpublish toggle
- ✅ Edit any post
- ✅ Delete posts with confirmation
- ✅ View post status at a glance
- ✅ See author information
- ✅ Check publication dates
- ✅ Monitor blog statistics
- ✅ Create new posts from dashboard
- ✅ Clickable links to view published posts

---

**Your blog content management just got a whole lot easier!** 🎉

Use the Admin Dashboard as your central hub for all blog management tasks.

