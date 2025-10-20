-- Add reel_url column to questions table
-- This migration adds support for storing reel/video URLs with questions

-- Add the reel_url column if it doesn't exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS reel_url TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN questions.reel_url IS 'Optional URL to a reel, short video, or social media post related to the question (Instagram Reels, YouTube Shorts, TikTok, etc.)';

-- Create an index for better performance when filtering by reel_url
CREATE INDEX IF NOT EXISTS idx_questions_reel_url ON questions(reel_url) WHERE reel_url IS NOT NULL;