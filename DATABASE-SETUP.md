# 🗄️ Database Setup Instructions

## Important: You Must Set Up the Database Before Using the App

Your app won't work until you apply the database migration. Follow these simple steps:

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project

### Step 2: Navigate to SQL Editor

1. Look for **"SQL Editor"** in the left sidebar
2. Click on it
3. Click the **"New Query"** button

### Step 3: Copy the Migration SQL

1. Open the file `supabase-migration.sql` in your project
2. Select ALL the SQL code (Cmd+A or Ctrl+A)
3. Copy it (Cmd+C or Ctrl+C)

### Step 4: Run the Migration

1. Paste the SQL code into the SQL Editor in Supabase
2. Click the **"Run"** button (or press Cmd+Enter / Ctrl+Enter)
3. Wait a few seconds

### Step 5: Verify Success

You should see a message like:
```
✓ Success. No rows returned
```

This means your database is ready! 🎉

---

## 🔍 What This Migration Creates

### Tables Created:

1. **`questions`** - Stores all anonymous questions
   - Question text
   - Tracking information
   - Device/browser data
   - Answer status

2. **`creator_profiles`** - Stores creator information
   - Display name
   - Bio
   - Custom URL slug

### Security Policies:

- ✅ Anonymous users can INSERT questions
- ✅ Only authenticated users can VIEW questions
- ✅ Row Level Security (RLS) enabled
- ✅ Data is protected

### Performance Indexes:

- Fast sorting by date
- Fast filtering by source
- Optimized queries

---

## ✅ Testing the Setup

After running the migration, test it:

1. Go to your app: `http://localhost:3000`
2. Submit a test question
3. Go to dashboard: `http://localhost:3000/dashboard`
4. Your test question should appear!

---

## 🚨 Troubleshooting

### "Permission denied" error?

Make sure you're logged into the correct Supabase project. Check that your project URL matches the one in your `.env` file.

### "Relation already exists" error?

This is fine! It means the tables were already created. The migration is idempotent (safe to run multiple times).

### Questions not appearing in dashboard?

1. Check browser console (F12) for errors
2. Verify your Supabase credentials in `.env`
3. Make sure you're on the same project
4. Try submitting another test question

### Can't run SQL in Supabase?

Make sure you have the correct permissions on your Supabase project. You need to be the project owner or have SQL execution permissions.

---

## 🎯 Alternative: Manual Table Creation

If the SQL migration doesn't work, you can create tables manually:

### Create Questions Table

1. Go to Supabase Dashboard
2. Click "Table Editor" in sidebar
3. Click "New Table"
4. Use these settings:
   - Name: `questions`
   - Enable RLS: ✅
   - Add columns as shown in `supabase-migration.sql`

### Create Policies

1. Go to "Authentication" → "Policies"
2. Select `questions` table
3. Add policies as shown in the migration file

---

## 📊 Viewing Your Data

### In Supabase Dashboard:

1. Go to **"Table Editor"**
2. Select `questions` table
3. See all submitted questions
4. View tracking data

### In Your App Dashboard:

1. Visit `http://localhost:3000/dashboard`
2. Real-time view of all questions
3. Answer and manage questions
4. View analytics

---

## 🔒 Security Notes

### What's Protected:

- ✅ Only you can view questions (when authenticated)
- ✅ Anonymous users can only submit, not view
- ✅ RLS policies prevent unauthorized access
- ✅ No one can delete questions except you

### What's Anonymous:

- ✅ No user identification stored
- ✅ Questions are truly anonymous
- ✅ Only tracking metadata is captured
- ✅ Users are informed about tracking

---

## 🎉 You're Done!

Once you see "Success" in the SQL Editor, your database is ready!

Next steps:
1. ✅ Database setup complete
2. 📱 Create your tracking links
3. 🚀 Share on social media
4. 👀 Watch questions roll in!

Check [SETUP-GUIDE.md](SETUP-GUIDE.md) for creating tracking links and sharing your platform.

---

**Need help? Review the error messages in Supabase or check your browser console for clues.**
