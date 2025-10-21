# Clerk Authentication Setup Guide

## Overview
This application uses Clerk for authentication. You need to set up a Clerk account and configure your environment variables to make authentication work.

## Step 1: Create a Clerk Account
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Sign up for a free account
3. Create a new application

## Step 2: Get Your Clerk Keys
1. In your Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

## Step 3: Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`
2. Replace the placeholder values:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-actual-publishable-key-here
   CLERK_SECRET_KEY=sk_test_your-actual-secret-key-here
   ```

## Step 4: Configure Clerk Settings
In your Clerk Dashboard:
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable the authentication methods you want to use
3. Go to **Paths** and configure:
   - Sign-in URL: `/login`
   - Sign-up URL: `/signup`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

## Step 5: Test Authentication
1. Start your development server: `npm run dev`
2. Navigate to `/login` to test sign-in
3. Navigate to `/signup` to test sign-up

## Troubleshooting

### "Invalid host" or "Publishable key not valid" errors
- Make sure your environment variables are correctly set
- Ensure you're using the correct keys from your Clerk Dashboard
- Restart your development server after changing environment variables

### Authentication not working
- Check that your Clerk application is active in the dashboard
- Verify your domain settings in Clerk Dashboard match your development URL
- Make sure you've copied the keys exactly without extra spaces

## Development vs Production
- Use `pk_test_` and `sk_test_` keys for development
- Use `pk_live_` and `sk_live_` keys for production
- Never commit your actual keys to version control

## Need Help?
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)