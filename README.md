# 🎭 Ask Me Anything - Anonymous Q&A Platform

A beautiful, modern anonymous question submission platform with glassmorphic UI, 3D animations, and smart tracking capabilities. Perfect for Instagram, Twitter, TikTok, and any social media platform.

![Built with Next.js](https://img.shields.io/badge/Next.js-13-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)

---

## ✨ Features

- 🎨 **Stunning Glassmorphic UI** - Beautiful frosted glass design with 3D card animations
- 📱 **Mobile-First & Responsive** - Optimized for Instagram stories and all devices
- 🎭 **100% Anonymous** - Users submit questions without revealing identity
- 📊 **Smart Tracking** - Track which platforms and links drive engagement
- ⚡ **Real-Time Updates** - Questions appear instantly in your dashboard
- 🔒 **Secure & Private** - Built with Supabase Row Level Security
- 🎯 **URL Parameter Tracking** - Know exactly where questions come from
- 💫 **Smooth Animations** - Framer Motion powered 3D effects
- 🌙 **Dark Theme** - Beautiful dark gradient background
- 📈 **Analytics Dashboard** - View stats, answer questions, track sources

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
Open `supabase-migration.sql` and run it in your [Supabase SQL Editor](https://supabase.com/dashboard)

See detailed instructions in [SETUP-GUIDE.md](SETUP-GUIDE.md)

### 3. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentation

- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Complete setup and usage guide
- **[TRACKING-EXAMPLES.md](TRACKING-EXAMPLES.md)** - URL tracking examples for all platforms

---

## 🎯 How It Works

### For Users (Submitting Questions)
1. Visit your custom link (e.g., `yoursite.com?source=instagram&from=story`)
2. Type anonymous question
3. Submit
4. Done! Completely anonymous

### For You (Receiving Questions)
1. Create tracking links for different platforms
2. Share links on Instagram, Twitter, etc.
3. View questions in real-time dashboard
4. See which platforms drive engagement
5. Answer questions directly

---

## 🔗 Creating Tracking Links

### Basic Format
```
https://your-site.com?source=PLATFORM&from=LOCATION
```

### Examples
```bash
# Instagram Story
https://your-site.com?source=instagram&from=story_oct20

# Twitter Bio
https://your-site.com?source=twitter&from=bio

# TikTok Video
https://your-site.com?source=tiktok&from=video_ama
```

See [TRACKING-EXAMPLES.md](TRACKING-EXAMPLES.md) for 50+ examples!

---

## 📱 Pages

### `/` - Main Landing Page
- Beautiful hero section with gradient background
- Anonymous question submission form
- Feature highlights
- 3D glassmorphic card with hover effects

### `/dashboard` - Admin Dashboard
- Real-time question feed
- Statistics (Total, Answered, Pending)
- Source tracking for each question
- Answer questions inline
- Filter and manage submissions

---

## 🎨 Tech Stack

- **Framework:** Next.js 13 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Date Formatting:** date-fns

---

## 🔒 Privacy & Security

### What's Tracked (Transparent)
✅ URL parameters you create
✅ Device type (Mobile/Desktop)
✅ Browser user agent
✅ Referrer URL
✅ Submission timestamp

### What's NOT Tracked
❌ User identity
❌ Instagram/Twitter usernames
❌ Personal information
❌ Login credentials

**Users are informed:** "Your question is completely anonymous. We only track the source link for analytics."

---

## 🎯 Use Cases

- **Content Creators** - Engage with followers anonymously
- **Influencers** - Collect questions for Q&A videos
- **Streamers** - Get questions during live streams
- **Podcasters** - Source questions from listeners
- **Educators** - Anonymous student questions
- **Community Managers** - Understand your audience
- **Personal Branding** - Build engagement

---

## 📊 Dashboard Features

### Statistics Cards
- Total questions received
- Answered questions count
- Pending questions count

### Question Management
- View all questions in chronological order
- See tracking data for each question
- Answer questions inline
- Mark as answered
- Real-time updates

### Tracking Information Per Question
- Source identifier (e.g., `instagram-story_oct20`)
- Time submitted (relative time)
- Device type
- Referrer URL
- User agent

---

## 🎨 Design Features

### Glassmorphism
- Frosted glass effect with backdrop blur
- Semi-transparent backgrounds
- Subtle borders with gradients
- Modern, premium feel

### 3D Animations
- Cards tilt on mouse movement
- Smooth spring animations
- Hover effects with depth
- Floating elements

### Gradient Accents
- Cyan and purple gradient theme
- Animated background meshes
- Glowing effects
- Modern color palette

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📱 Sharing on Social Media

### Instagram
- Add tracking link to bio
- Share in stories with link sticker
- Include in post captions
- Add to highlights

### Twitter/X
- Pin tweet with link
- Add to bio
- Share in threads

### TikTok
- Add to video descriptions
- Include in bio

### YouTube
- Video descriptions
- Pinned comments
- Channel about page

---

## 🛠️ Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Apply database migration
node scripts/apply-migration.js
```

---

## 📋 Database Schema

### `questions` Table
- Anonymous question submissions
- Tracking metadata
- Answer status and text
- Timestamps

### `creator_profiles` Table
- Creator information
- Custom slugs
- Profile settings

Full schema in `supabase-migration.sql`

---

## 🎯 Customization

### Colors
Edit `app/globals.css` to change the color scheme

### Tracking Parameters
Add any custom parameters you want:
```
?source=platform&from=location&campaign=name&user_segment=type
```

### Branding
Update:
- Site title in `app/layout.tsx`
- Logo in `app/page.tsx`
- Colors and gradients

---

## 🆘 Troubleshooting

### Questions not appearing?
- Verify database migration ran successfully
- Check Supabase connection
- Ensure RLS policies are active

### Can't submit questions?
- Check minimum character requirement (10)
- Verify Supabase credentials
- Check browser console for errors

### Tracking not working?
- Ensure URL parameters are correct format
- Check dashboard to see what was captured
- Test with different browsers

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Shadcn UI](https://ui.shadcn.com)

---

## 🎉 You're Ready!

1. ✅ Database is set up
2. ✅ App is built and ready
3. ✅ Tracking is configured
4. ✅ Dashboard is functional

**Start sharing your links and collecting questions!**

Need help? Check the [SETUP-GUIDE.md](SETUP-GUIDE.md) or [TRACKING-EXAMPLES.md](TRACKING-EXAMPLES.md)

---

## 📄 License

MIT License - feel free to use for personal or commercial projects!

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**

🚀 **Happy question collecting!**
