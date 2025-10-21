/*
  # Fresh Migration - Ask Me Anything Application
  
  ## Overview
  Complete database schema for Ask Me Anything application with integrated chat system.
  This migration creates all necessary tables, indexes, RLS policies, and functions.
  
  ## Features
  - Anonymous question submission system
  - Creator profiles with custom usernames
  - Real-time chat system with rooms and messaging
  - Timer messages with automatic expiration
  - Media sharing support
  - Clerk authentication integration
  - Row Level Security (RLS) for data protection
  - Performance optimizations
  
  ## Tables Created
  1. questions - Anonymous questions for creators
  2. creator_profiles - Creator profile information
  3. chat_users - Chat user profiles with online status
  4. chat_rooms - Chat rooms with flexible configuration
  5. room_members - Room membership management
  6. chat_messages - Messages with rich media and timer support
  7. message_views - Message view analytics
  8. typing_indicators - Real-time typing status
*/

-- =====================================================
-- 1. QUESTIONS TABLE
-- =====================================================

CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_username TEXT NOT NULL,
  question_text TEXT NOT NULL,
  reel_url TEXT,
  source_identifier TEXT,
  user_agent TEXT,
  referrer TEXT,
  user_id TEXT, -- Clerk user ID for tracking
  is_answered BOOLEAN DEFAULT false,
  answer_text TEXT,
  answered_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 2. CREATOR PROFILES TABLE
-- =====================================================

CREATE TABLE creator_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID (string)
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{
    "allow_anonymous_questions": true,
    "auto_publish_answers": false,
    "email_notifications": true
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 3. CHAT USERS TABLE
-- =====================================================

CREATE TABLE chat_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id TEXT, -- Clerk user ID (string) - can be NULL for anonymous users
  username TEXT NOT NULL UNIQUE,
  is_anonymous BOOLEAN DEFAULT false,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  settings JSONB DEFAULT '{
    "notifications": true,
    "sound_enabled": true,
    "theme": "system"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 4. CHAT ROOMS TABLE
-- =====================================================

CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL CHECK (room_type IN ('public', 'private', 'direct')),
  creator_id UUID REFERENCES chat_users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{
    "screenshot_blocking": false,
    "message_retention": "forever",
    "max_members": 100
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 5. ROOM MEMBERS TABLE
-- =====================================================

CREATE TABLE room_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_muted BOOLEAN DEFAULT false,
  muted_until TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- =====================================================
-- 6. CHAT MESSAGES TABLE
-- =====================================================

CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'gif', 'file')),
  media_url TEXT,
  media_metadata JSONB DEFAULT '{}'::jsonb,
  timer_duration INTEGER, -- Duration in seconds for timer messages
  expires_at TIMESTAMPTZ, -- Calculated expiration time for timer messages
  is_deleted BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 7. MESSAGE VIEWS TABLE
-- =====================================================

CREATE TABLE message_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  view_duration INTEGER DEFAULT 0, -- Duration in milliseconds
  UNIQUE(message_id, viewer_id)
);

-- =====================================================
-- 8. TYPING INDICATORS TABLE
-- =====================================================

CREATE TABLE typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(room_id, user_id)
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Questions table indexes
CREATE INDEX idx_questions_creator_username ON questions(creator_username);
CREATE INDEX idx_questions_is_answered ON questions(is_answered);
CREATE INDEX idx_questions_is_public ON questions(is_public);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);

-- Creator Profiles indexes
CREATE INDEX idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX idx_creator_profiles_username ON creator_profiles(username);
CREATE INDEX idx_creator_profiles_is_active ON creator_profiles(is_active);

-- Chat Users indexes
CREATE INDEX idx_chat_users_auth_user_id ON chat_users(auth_user_id);
CREATE INDEX idx_chat_users_username ON chat_users(username);
CREATE INDEX idx_chat_users_is_online ON chat_users(is_online);

-- Chat Rooms indexes
CREATE INDEX idx_chat_rooms_room_type ON chat_rooms(room_type);
CREATE INDEX idx_chat_rooms_creator_id ON chat_rooms(creator_id);
CREATE INDEX idx_chat_rooms_is_active ON chat_rooms(is_active);

-- Room Members indexes
CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
CREATE INDEX idx_room_members_role ON room_members(role);

-- Chat Messages indexes
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_expires_at ON chat_messages(expires_at);
CREATE INDEX idx_chat_messages_reply_to_id ON chat_messages(reply_to_id);
CREATE INDEX idx_chat_messages_is_deleted ON chat_messages(is_deleted);

-- Message Views indexes
CREATE INDEX idx_message_views_message_id ON message_views(message_id);
CREATE INDEX idx_message_views_viewer_id ON message_views(viewer_id);
CREATE INDEX idx_message_views_viewed_at ON message_views(viewed_at DESC);

-- Typing Indicators indexes
CREATE INDEX idx_typing_indicators_room_id ON typing_indicators(room_id);
CREATE INDEX idx_typing_indicators_expires_at ON typing_indicators(expires_at);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- QUESTIONS TABLE POLICIES
-- =====================================================

-- Anyone can view public questions
CREATE POLICY "Anyone can view public questions" ON questions
  FOR SELECT USING (is_public = true);

-- Anyone can submit questions (anonymous submission)
CREATE POLICY "Anyone can submit questions" ON questions
  FOR INSERT WITH CHECK (true);

-- Only the creator can view all their questions (public and private)
CREATE POLICY "Creators can view all their questions" ON questions
  FOR SELECT USING (
    creator_username IN (
      SELECT username FROM creator_profiles 
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- Only the creator can update their questions (answer them)
CREATE POLICY "Creators can update their questions" ON questions
  FOR UPDATE USING (
    creator_username IN (
      SELECT username FROM creator_profiles 
      WHERE user_id = auth.uid()::TEXT
    )
  );

-- =====================================================
-- CREATOR PROFILES TABLE POLICIES
-- =====================================================

-- Anyone can view active creator profiles
CREATE POLICY "Anyone can view active creator profiles" ON creator_profiles
  FOR SELECT USING (is_active = true);

-- Users can create their own profile
CREATE POLICY "Users can create their own profile" ON creator_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid()::TEXT);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON creator_profiles
  FOR UPDATE USING (user_id = auth.uid()::TEXT);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON creator_profiles
  FOR DELETE USING (user_id = auth.uid()::TEXT);

-- =====================================================
-- CHAT USERS TABLE POLICIES
-- =====================================================

-- Users can view all chat users
CREATE POLICY "Users can view all chat users" ON chat_users
  FOR SELECT USING (true);

-- Users can insert their own chat profile
CREATE POLICY "Users can insert their own chat profile" ON chat_users
  FOR INSERT WITH CHECK (
    auth_user_id = auth.uid()::TEXT OR 
    (auth_user_id IS NULL AND is_anonymous = true)
  );

-- Users can update their own chat profile
CREATE POLICY "Users can update their own chat profile" ON chat_users
  FOR UPDATE USING (
    auth_user_id = auth.uid()::TEXT OR 
    (auth_user_id IS NULL AND is_anonymous = true)
  );

-- =====================================================
-- CHAT ROOMS TABLE POLICIES
-- =====================================================

-- Users can view active public rooms or rooms they belong to
CREATE POLICY "Users can view accessible rooms" ON chat_rooms
  FOR SELECT USING (
    is_active = true AND 
    (room_type = 'public' OR 
     EXISTS (SELECT 1 FROM room_members WHERE room_id = chat_rooms.id AND user_id IN (
       SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT
     )))
  );

-- Authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Room creators and admins can update rooms
CREATE POLICY "Room creators and admins can update rooms" ON chat_rooms
  FOR UPDATE USING (
    creator_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT) OR
    EXISTS (
      SELECT 1 FROM room_members rm 
      JOIN chat_users cu ON rm.user_id = cu.id 
      WHERE rm.room_id = chat_rooms.id 
      AND cu.auth_user_id = auth.uid()::TEXT 
      AND rm.role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- ROOM MEMBERS TABLE POLICIES
-- =====================================================

-- Users can view members of rooms they belong to
CREATE POLICY "Users can view members of accessible rooms" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members rm2 
      JOIN chat_users cu ON rm2.user_id = cu.id 
      WHERE rm2.room_id = room_members.room_id 
      AND cu.auth_user_id = auth.uid()::TEXT
    ) OR
    EXISTS (
      SELECT 1 FROM chat_rooms cr 
      WHERE cr.id = room_members.room_id 
      AND cr.room_type = 'public'
    )
  );

-- Users can join rooms
CREATE POLICY "Users can join rooms" ON room_members
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT)
  );

-- Users can leave rooms or admins can manage members
CREATE POLICY "Users can leave rooms or admins can manage members" ON room_members
  FOR DELETE USING (
    user_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT) OR
    EXISTS (
      SELECT 1 FROM room_members rm 
      JOIN chat_users cu ON rm.user_id = cu.id 
      WHERE rm.room_id = room_members.room_id 
      AND cu.auth_user_id = auth.uid()::TEXT 
      AND rm.role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- CHAT MESSAGES TABLE POLICIES
-- =====================================================

-- Users can view messages in rooms they belong to
CREATE POLICY "Users can view messages in accessible rooms" ON chat_messages
  FOR SELECT USING (
    NOT is_deleted AND
    (expires_at IS NULL OR expires_at > now()) AND
    (
      EXISTS (
        SELECT 1 FROM room_members rm 
        JOIN chat_users cu ON rm.user_id = cu.id 
        WHERE rm.room_id = chat_messages.room_id 
        AND cu.auth_user_id = auth.uid()::TEXT
      ) OR
      EXISTS (
        SELECT 1 FROM chat_rooms cr 
        WHERE cr.id = chat_messages.room_id 
        AND cr.room_type = 'public'
      )
    )
  );

-- Room members can send messages
CREATE POLICY "Room members can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT) AND
    EXISTS (
      SELECT 1 FROM room_members rm 
      JOIN chat_users cu ON rm.user_id = cu.id 
      WHERE rm.room_id = chat_messages.room_id 
      AND cu.auth_user_id = auth.uid()::TEXT
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (
    sender_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT)
  );

-- =====================================================
-- MESSAGE VIEWS TABLE POLICIES
-- =====================================================

-- Users can view message views for their messages or their own views
CREATE POLICY "Users can view relevant message views" ON message_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_messages cm 
      JOIN chat_users cu ON cm.sender_id = cu.id 
      WHERE cm.id = message_views.message_id 
      AND cu.auth_user_id = auth.uid()::TEXT
    ) OR
    viewer_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT)
  );

-- Users can record their own message views
CREATE POLICY "Users can record their own message views" ON message_views
  FOR INSERT WITH CHECK (
    viewer_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT)
  );

-- =====================================================
-- TYPING INDICATORS TABLE POLICIES
-- =====================================================

-- Users can view typing indicators in their rooms
CREATE POLICY "Users can view typing indicators in their rooms" ON typing_indicators
  FOR SELECT USING (
    expires_at > now() AND
    EXISTS (
      SELECT 1 FROM room_members rm 
      JOIN chat_users cu ON rm.user_id = cu.id 
      WHERE rm.room_id = typing_indicators.room_id 
      AND cu.auth_user_id = auth.uid()::TEXT
    )
  );

-- Users can manage their own typing indicators
CREATE POLICY "Users can manage their own typing indicators" ON typing_indicators
  FOR ALL USING (
    user_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()::TEXT)
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically set expires_at for timer messages
CREATE OR REPLACE FUNCTION set_message_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.timer_duration IS NOT NULL AND NEW.timer_duration > 0 THEN
    NEW.expires_at = NEW.created_at + (NEW.timer_duration || ' seconds')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set message expiration
CREATE TRIGGER trigger_set_message_expiration
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_expiration();

-- Function to clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators WHERE expires_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at columns
CREATE TRIGGER trigger_update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_creator_profiles_updated_at
  BEFORE UPDATE ON creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create a default public chat room
INSERT INTO chat_rooms (id, name, description, room_type, settings, is_active)
VALUES (
  gen_random_uuid(),
  'General Chat',
  'Welcome to the general chat room! Feel free to introduce yourself and start conversations.',
  'public',
  '{
    "screenshot_blocking": false,
    "message_retention": "forever",
    "max_members": 1000
  }'::jsonb,
  true
);

/*
  ## Migration Complete!
  
  This migration creates a complete database schema for your Ask Me Anything application
  with integrated chat functionality. All tables use TEXT type for user_id fields to
  properly work with Clerk authentication.
  
  ### Key Features:
  - ✅ Anonymous question submission
  - ✅ Creator profiles with custom usernames
  - ✅ Real-time chat system
  - ✅ Timer messages with auto-expiration
  - ✅ Media sharing support
  - ✅ Row Level Security (RLS) enabled
  - ✅ Performance indexes
  - ✅ Proper Clerk integration with TEXT user IDs
  
  ### Next Steps:
  1. Copy this entire file content
  2. Go to your Supabase Dashboard
  3. Navigate to SQL Editor
  4. Paste and run this migration
  5. Your database will be ready to use!
*/