# Ask Me Anything - Setup Guide

## 🎉 Your Anonymous Q&A Platform is Ready!

This is a beautiful, modern "Ask Me Anything" platform where users can submit questions anonymously, and you can track where they came from (but not who they are).

---

## 📋 Step 1: Set Up the Database

You need to apply the database migration to create the necessary tables. Here are two ways to do it:

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Open the file `supabase-migration.sql` in your project
6. Copy all the SQL code
7. Paste it into the SQL Editor
8. Click "Run" (or press Cmd/Ctrl + Enter)

You should see "Success. No rows returned" - this means your database is ready!

### Option B: Using the Migration Script (Alternative)

```bash
node scripts/apply-migration.js
```

Note: This might not work due to RPC limitations, so Option A is recommended.

---

## 🎯 Step 2: How the Tracking Works

### Important: Privacy Notice

**You CANNOT automatically capture Instagram usernames or IDs.** This is protected by privacy laws and platform policies.

### What You CAN Track:

✅ **URL Parameters** - You add these manually when sharing links
✅ **Source Platform** - Which link was used (Instagram story, bio, Twitter, etc.)
✅ **Device Info** - Mobile or desktop, browser type
✅ **Referrer URL** - Which website they came from
✅ **IP Address** - General location (for analytics only)
✅ **Timestamp** - When the question was submitted

### Creating Trackable Links

When you share your link, add tracking parameters:

**For Instagram Story:**
```
https://your-site.com?source=instagram&from=story_oct20
```

**For Instagram Bio:**
```
https://your-site.com?source=instagram&from=bio_link
```

**For Twitter:**
```
https://your-site.com?source=twitter&from=pinned_tweet
```

**For Reddit:**
```
https://your-site.com?source=reddit&from=r_AMA
```

### How to Use This Information

When someone submits a question using the link above, you'll see in the dashboard:
- Source: `instagram-story_oct20`
- This tells you it came from your Instagram story posted on Oct 20

You can create different links for:
- Different posts
- Different platforms
- Different campaigns
- Different time periods

This way, you'll know which content drives the most engagement!

---

## 🚀 Step 3: Start Using Your Platform

### For Users (Question Submitters):

1. Visit your main page: `http://localhost:3000`
2. Type their anonymous question (minimum 10 characters)
3. Click "Submit Question"
4. Done! Their identity remains completely private

### For You (Admin):

1. Visit the dashboard: `http://localhost:3000/dashboard`
2. See all submitted questions in real-time
3. View tracking information for each question
4. Answer questions directly from the dashboard
5. Mark questions as answered

---

## 🎨 Features Included

✨ **Glassmorphic UI** - Beautiful frosted glass effect with 3D animations
📱 **Mobile Responsive** - Optimized for Instagram stories and mobile devices
🎭 **100% Anonymous** - No user identification, completely private
📊 **Analytics Dashboard** - Track sources, view stats, manage questions
⚡ **Real-time Updates** - New questions appear instantly
🔒 **Secure** - Built with Supabase RLS policies
🎯 **URL Tracking** - Know which links drive engagement

---

## 📱 Sharing on Instagram

### For Instagram Story:

1. Create your custom tracking link:
   ```
   https://your-site.com?source=instagram&from=story_nov15
   ```

2. Use a link shortener for cleaner appearance:
   - [Bitly](https://bitly.com) - Shows click analytics
   - [Rebrandly](https://rebrandly.com) - Custom domain
   - [Linktree](https://linktr.ee) - Multiple links

3. Add link to your story:
   - Post your story content
   - Add link sticker
   - Paste your trackable link
   - Done!

### For Instagram Bio:

1. Create a bio link:
   ```
   https://your-site.com?source=instagram&from=bio
   ```

2. Add to your Instagram bio
3. Promote in your posts and stories

---

## 🔧 Customization Ideas

### Custom URL Parameters

You can track anything you want by adding parameters:

- Campaign tracking: `?campaign=launch_week`
- Influencer tracking: `?partner=friend_username`
- Event tracking: `?event=birthday_ama`
- Time tracking: `?date=2024_oct`

### Multiple Tracking Parameters

Combine multiple parameters:
```
https://your-site.com?source=instagram&from=story&campaign=launch&date=oct20
```

---

## 📊 Dashboard Features

### Statistics Cards:
- **Total Questions** - All questions received
- **Answered** - Questions you've responded to
- **Pending** - Questions waiting for your answer

### Question Cards Show:
- Question text
- Source/tracking identifier
- Time submitted (e.g., "5 minutes ago")
- Device type (Mobile/Desktop)
- Referrer URL
- Answer status

### Actions You Can Take:
- Answer questions inline
- View all tracking data
- Refresh to get latest questions
- Real-time updates (questions appear automatically)

---

## 🎯 Best Practices

1. **Create Unique Links** for each platform/post
2. **Use Consistent Naming** for easier tracking (e.g., always use "instagram" not "ig" or "insta")
3. **Document Your Links** - Keep a spreadsheet of which links you used where
4. **Use Link Shorteners** - Makes links look cleaner and provides extra analytics
5. **Test Your Links** - Always test before sharing publicly
6. **Monitor Your Dashboard** - Check regularly for new questions

---

## 🔒 Privacy & Ethics

### What's Tracked (Transparent):
- The link they used (you created it)
- Device and browser info (standard web analytics)
- Time of submission
- General location (from IP)

### What's NOT Tracked:
- Instagram username
- User identity
- Personal information
- Login details

### Be Transparent:
Your app already shows users: "Your question is completely anonymous. We only track the source link for analytics."

This is honest and ethical tracking!

---

## 🚀 Deployment

When you're ready to go live:

1. Deploy to Vercel (recommended)
2. Update your Supabase project settings
3. Add your production domain to Supabase allowed domains
4. Replace `your-site.com` with your actual domain in all links

---

## 💡 Tips for Maximum Engagement

1. **Tell Your Followers** - Announce on Instagram that questions are anonymous
2. **Ask for Questions** - Post stories like "AMA! Link in bio 👀"
3. **Answer Publicly** - Share interesting answers on your stories
4. **Create Themes** - "Monday Q&A", "Friday Confession Booth"
5. **Respond Quickly** - People love fast responses
6. **Be Authentic** - The anonymity encourages real questions

---

## 🎨 The Tech Stack

- **Next.js 13** - React framework with App Router
- **Supabase** - Database, real-time subscriptions, RLS
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth 3D animations
- **Shadcn UI** - Beautiful component library
- **Glassmorphism** - Modern frosted glass design

---

## 🆘 Troubleshooting

### Questions not showing in dashboard?
- Check that the migration ran successfully
- Verify your Supabase connection
- Check browser console for errors

### Can't submit questions?
- Ensure minimum 10 characters
- Check network connection
- Verify Supabase is running

### Tracking not working?
- Verify you added parameters to your URL
- Check the dashboard to see what was captured
- Make sure the URL format is correct

---

## 🎉 You're All Set!

Start sharing your custom links and watch the questions roll in!

Remember: Be creative with your tracking parameters, stay transparent with users, and have fun with your anonymous Q&A platform!

Need help? Check the code comments or revisit this guide.

**Happy question collecting! 🚀**
