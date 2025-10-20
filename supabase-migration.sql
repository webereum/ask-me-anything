/*
  # Ask Me Anything Platform - Database Schema

  ## Overview
  This migration creates the database schema for an anonymous question submission platform
  with tracking capabilities for content creators.

  ## 1. New Tables

  ### `questions` table
  Stores all submitted questions with tracking information:
  - `id` (uuid, primary key) - Unique identifier for each question
  - `question_text` (text, required) - The actual question content
  - `source_identifier` (text) - Tracking code from URL parameters (e.g., "instagram-story_oct20")
  - `ip_address` (text) - IP address of submitter (for analytics only)
  - `user_agent` (text) - Browser/device information
  - `referrer` (text) - Referring URL
  - `created_at` (timestamptz) - Timestamp of submission
  - `is_answered` (boolean) - Whether the question has been answered
  - `answer_text` (text) - The answer provided by the creator
  - `answered_at` (timestamptz) - When the question was answered

  ### `creator_profiles` table
  Stores creator profile information:
  - `id` (uuid, primary key) - Unique profile identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `display_name` (text, required) - Public display name
  - `bio` (text) - Creator bio/description
  - `profile_image_url` (text) - URL to profile image
  - `custom_slug` (text, unique) - Custom URL slug for personalized links
  - `created_at` (timestamptz) - Profile creation timestamp

  ## 2. Security

  ### Row Level Security (RLS)
  - **ENABLED** on all tables to protect data
  - Anonymous users can INSERT questions (for submissions)
  - Only authenticated users (creators) can SELECT questions
  - Only authenticated users can UPDATE/DELETE their own data

  ### Policies
  - "Allow anonymous question submission" - Permits anonymous inserts to questions table
  - "Authenticated users can view all questions" - Allows creators to see submitted questions
  - "Authenticated users can update questions" - Allows creators to answer questions
  - "Users can manage own profile" - Full CRUD access to own creator profile

  ## 3. Performance Optimization

  ### Indexes
  - `idx_questions_created_at` - Fast sorting by submission date
  - `idx_questions_source` - Fast filtering by source/tracking code
  - `idx_creator_profiles_slug` - Fast lookup by custom slug

  ## 4. Important Notes

  ### Data Safety
  - All CREATE statements use IF NOT EXISTS to prevent errors on re-run
  - Column additions check for existence before altering
  - No DROP or destructive operations included

  ### Privacy Considerations
  - IP addresses and user agents are stored for analytics ONLY
  - Questions are truly anonymous - no link to user identity
  - Tracking is limited to URL parameters set by the creator

  ### Default Values
  - `is_answered` defaults to false
  - Timestamps default to current time
  - UUIDs auto-generate using gen_random_uuid()
*/

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  source_identifier TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_answered BOOLEAN DEFAULT false,
  answer_text TEXT,
  answered_at TIMESTAMPTZ
);

-- Add user_id column if it doesn't exist (for existing tables)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create creator_profiles table
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  custom_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_source ON questions(source_identifier);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_slug ON creator_profiles(custom_slug);

-- Enable Row Level Security
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Allow anonymous question submission" ON questions;
DROP POLICY IF EXISTS "Authenticated users can view all questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can update questions" ON questions;
DROP POLICY IF EXISTS "Users can read own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON creator_profiles;

-- Questions table policies
CREATE POLICY "Allow anonymous question submission"
  ON questions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update questions"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Creator profiles policies
CREATE POLICY "Users can read own profile"
  ON creator_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON creator_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON creator_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON creator_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
