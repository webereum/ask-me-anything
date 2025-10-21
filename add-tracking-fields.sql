-- =====================================================
-- ADD TRACKING FIELDS TO QUESTIONS TABLE
-- =====================================================
-- Run this file in your SQL editor to add tracking fields
-- to an existing questions table
-- =====================================================

-- Add the new tracking fields to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS reel_url TEXT,
ADD COLUMN IF NOT EXISTS source_identifier TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN questions.reel_url IS 'URL of the reel/video associated with the question';
COMMENT ON COLUMN questions.source_identifier IS 'Tracking identifier from URL parameters (e.g., instagram-story)';
COMMENT ON COLUMN questions.user_agent IS 'Browser/device information for analytics';
COMMENT ON COLUMN questions.referrer IS 'Website that referred the user';
COMMENT ON COLUMN questions.user_id IS 'Anonymous user identifier for tracking purposes';

-- Create indexes for better query performance on tracking fields
CREATE INDEX IF NOT EXISTS idx_questions_source_identifier ON questions(source_identifier);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questions' 
ORDER BY ordinal_position;