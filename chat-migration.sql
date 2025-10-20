/*
  # Chat System - Database Schema Migration

  ## Overview
  This migration creates the complete database schema for the real-time chat system
  with support for public/private rooms, timer messages, media sharing, and user management.

  ## Tables Created

  ### 1. `chat_users` table
  Chat-specific user profiles with online status and settings:
  - Supports both authenticated and anonymous users
  - Tracks online status and last seen timestamps
  - User preferences for notifications, sounds, and themes

  ### 2. `chat_rooms` table
  Chat rooms with flexible configuration:
  - Public, private, and direct message room types
  - Configurable settings (screenshot blocking, message retention, member limits)
  - Room metadata and member counting

  ### 3. `chat_messages` table
  Messages with rich media and timer support:
  - Text, image, GIF, and file message types
  - Timer messages with automatic expiration
  - Reply threading and message metadata
  - Soft deletion for message management

  ### 4. `room_members` table
  Room membership management:
  - Role-based access (admin, moderator, member)
  - Muting capabilities with expiration
  - Join/leave tracking

  ### 5. `message_views` table
  Message view analytics:
  - Track who viewed which messages
  - View duration for analytics
  - Support for timer message tracking

  ### 6. `typing_indicators` table
  Real-time typing status:
  - Temporary indicators with expiration
  - Real-time updates via Supabase subscriptions

  ## Security Features
  - Row Level Security (RLS) enabled on all tables
  - Comprehensive policies for different user roles
  - Anonymous user support with appropriate restrictions
  - Data privacy and access control

  ## Performance Optimizations
  - Strategic indexes for common queries
  - Efficient foreign key relationships
  - Optimized for real-time subscriptions
*/

-- =====================================================
-- 1. CHAT USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
-- 2. CHAT ROOMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_rooms (
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
-- 3. ROOM MEMBERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS room_members (
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
-- 4. CHAT MESSAGES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS chat_messages (
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
-- 5. MESSAGE VIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS message_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  view_duration INTEGER DEFAULT 0, -- Duration in milliseconds
  UNIQUE(message_id, viewer_id)
);

-- =====================================================
-- 6. TYPING INDICATORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(room_id, user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Chat Users indexes
CREATE INDEX IF NOT EXISTS idx_chat_users_auth_user_id ON chat_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_users_username ON chat_users(username);
CREATE INDEX IF NOT EXISTS idx_chat_users_is_online ON chat_users(is_online);

-- Chat Rooms indexes
CREATE INDEX IF NOT EXISTS idx_chat_rooms_room_type ON chat_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_creator_id ON chat_rooms(creator_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_active ON chat_rooms(is_active);

-- Room Members indexes
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_room_members_role ON room_members(role);

-- Chat Messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_expires_at ON chat_messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_reply_to_id ON chat_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_deleted ON chat_messages(is_deleted);

-- Message Views indexes
CREATE INDEX IF NOT EXISTS idx_message_views_message_id ON message_views(message_id);
CREATE INDEX IF NOT EXISTS idx_message_views_viewer_id ON message_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_message_views_viewed_at ON message_views(viewed_at DESC);

-- Typing Indicators indexes
CREATE INDEX IF NOT EXISTS idx_typing_indicators_room_id ON typing_indicators(room_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_expires_at ON typing_indicators(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Chat Users Policies
CREATE POLICY "Users can view all chat users" ON chat_users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own chat profile" ON chat_users
  FOR INSERT WITH CHECK (
    auth_user_id = auth.uid() OR 
    (auth_user_id IS NULL AND is_anonymous = true)
  );

CREATE POLICY "Users can update their own chat profile" ON chat_users
  FOR UPDATE USING (
    auth_user_id = auth.uid() OR 
    (auth_user_id IS NULL AND is_anonymous = true)
  );

-- Chat Rooms Policies
CREATE POLICY "Users can view active public rooms" ON chat_rooms
  FOR SELECT USING (
    is_active = true AND 
    (room_type = 'public' OR 
     EXISTS (SELECT 1 FROM room_members WHERE room_id = chat_rooms.id AND user_id IN (
       SELECT id FROM chat_users WHERE auth_user_id = auth.uid()
     )))
  );

CREATE POLICY "Authenticated users can create rooms" ON chat_rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Room creators and admins can update rooms" ON chat_rooms
  FOR UPDATE USING (
    creator_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM room_members rm 
      JOIN chat_users cu ON rm.user_id = cu.id 
      WHERE rm.room_id = chat_rooms.id 
      AND cu.auth_user_id = auth.uid() 
      AND rm.role IN ('admin', 'moderator')
    )
  );

-- Room Members Policies
CREATE POLICY "Users can view members of rooms they belong to" ON room_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_members rm2 
      JOIN chat_users cu ON rm2.user_id = cu.id 
      WHERE rm2.room_id = room_members.room_id 
      AND cu.auth_user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM chat_rooms cr 
      WHERE cr.id = room_members.room_id 
      AND cr.room_type = 'public'
    )
  );

CREATE POLICY "Users can join rooms" ON room_members
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can leave rooms or admins can manage members" ON room_members
  FOR DELETE USING (
    user_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM room_members rm 
      JOIN chat_users cu ON rm.user_id = cu.id 
      WHERE rm.room_id = room_members.room_id 
      AND cu.auth_user_id = auth.uid() 
      AND rm.role IN ('admin', 'moderator')
    )
  );

-- Chat Messages Policies
CREATE POLICY "Users can view messages in rooms they belong to" ON chat_messages
  FOR SELECT USING (
    NOT is_deleted AND
    (expires_at IS NULL OR expires_at > now()) AND
    (
      EXISTS (
        SELECT 1 FROM room_members rm 
        JOIN chat_users cu ON rm.user_id = cu.id 
        WHERE rm.room_id = chat_messages.room_id 
        AND cu.auth_user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM chat_rooms cr 
        WHERE cr.id = chat_messages.room_id 
        AND cr.room_type = 'public'
      )
    )
  );

CREATE POLICY "Room members can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM room_members rm 
      JOIN chat_users cu ON rm.user_id = cu.id 
      WHERE rm.room_id = chat_messages.room_id 
      AND cu.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (
    sender_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid())
  );

-- Message Views Policies
CREATE POLICY "Users can view message views for their messages" ON message_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_messages cm 
      JOIN chat_users cu ON cm.sender_id = cu.id 
      WHERE cm.id = message_views.message_id 
      AND cu.auth_user_id = auth.uid()
    ) OR
    viewer_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can record their own message views" ON message_views
  FOR INSERT WITH CHECK (
    viewer_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid())
  );

-- Typing Indicators Policies
CREATE POLICY "Users can view typing indicators in their rooms" ON typing_indicators
  FOR SELECT USING (
    expires_at > now() AND
    EXISTS (
      SELECT 1 FROM room_members rm 
      JOIN chat_users cu ON rm.user_id = cu.id 
      WHERE rm.room_id = typing_indicators.room_id 
      AND cu.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own typing indicators" ON typing_indicators
  FOR ALL USING (
    user_id IN (SELECT id FROM chat_users WHERE auth_user_id = auth.uid())
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

-- Trigger to update updated_at on chat_messages
CREATE TRIGGER trigger_update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Create a default public room
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
) ON CONFLICT DO NOTHING;

/*
  ## Usage Notes

  ### Timer Messages
  - Set `timer_duration` in seconds (1-60 recommended)
  - `expires_at` is automatically calculated
  - Expired messages are filtered out in queries

  ### Anonymous Users
  - Set `is_anonymous = true` and `auth_user_id = NULL`
  - Generate unique usernames for anonymous users
  - Anonymous users have limited permissions

  ### Real-time Features
  - Use Supabase subscriptions on these tables for real-time updates
  - Typing indicators auto-expire and should be cleaned up periodically
  - Message views track engagement analytics

  ### Performance Considerations
  - Indexes are optimized for common query patterns
  - Use pagination for message loading
  - Consider archiving old messages based on retention settings
*/