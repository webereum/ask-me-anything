-- Create user_profiles table for AMA pages
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id column to questions table if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own profile" 
ON user_profiles FOR UPDATE 
USING (true);

-- Create policies for questions with user_id
CREATE POLICY "Questions for specific users are viewable by everyone" 
ON questions FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert questions" 
ON questions FOR INSERT 
WITH CHECK (true);