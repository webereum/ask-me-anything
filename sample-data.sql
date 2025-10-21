-- =====================================================
-- SAMPLE DATA FOR AMA APPLICATION
-- =====================================================
-- This file contains sample data for all tables in the AMA application
-- Import this after running fresh-migration.sql
-- =====================================================

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM question_views;
-- DELETE FROM chat_messages;
-- DELETE FROM questions;
-- DELETE FROM chat_users;
-- DELETE FROM chat_rooms WHERE id != 'public-general';
-- DELETE FROM creator_profiles;

-- =====================================================
-- 1. CREATOR PROFILES (Sample Users)
-- =====================================================

INSERT INTO creator_profiles (
    user_id, 
    username,
    display_name, 
    bio, 
    avatar_url, 
    social_links,
    created_at,
    updated_at
) VALUES 
-- Tech Influencer
('user_tech_guru_123', 'alexchen', 'Alex Chen', 'Full-stack developer and tech educator. Building the future one line of code at a time! 🚀', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '{"twitter": "alexchen_dev", "github": "alexchen", "linkedin": "alex-chen-dev"}', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'),

-- Fitness Coach
('user_fitness_coach_456', 'sarahfitness', 'Sarah Johnson', 'Certified personal trainer helping you achieve your fitness goals. Mind, body, and soul! 💪', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', '{"instagram": "sarahfitness", "youtube": "SarahJohnsonFit"}', NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days'),

-- Artist
('user_artist_789', 'mayaart', 'Maya Rodriguez', 'Digital artist and illustrator. Creating magic through pixels and imagination ✨', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', '{"instagram": "maya_creates", "behance": "mayarodriguez"}', NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days'),

-- Entrepreneur
('user_entrepreneur_101', 'davidkim', 'David Kim', 'Serial entrepreneur and startup mentor. Turning ideas into reality since 2015 🎯', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', '{"twitter": "david_kim_ent", "linkedin": "davidkim-entrepreneur"}', NOW() - INTERVAL '15 days', NOW() - INTERVAL '1 day'),

-- Chef
('user_chef_202', 'chefisabella', 'Isabella Martinez', 'Professional chef and food blogger. Bringing flavors from around the world to your kitchen! 👨‍🍳', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', '{"instagram": "chef_isabella", "youtube": "IsabellaKitchen"}', NOW() - INTERVAL '10 days', NOW() - INTERVAL '4 hours'),

-- Your test user
('user_34LJEmlrAJNBBOVihJdUEi9iYs0', 'admin192', 'Admin User', 'Test administrator account for the AMA platform. Ask me anything about how this platform works!', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', '{"website": "localhost:3001"}', NOW() - INTERVAL '1 day', NOW());

-- =====================================================
-- 2. QUESTIONS (Sample AMAs)
-- =====================================================

INSERT INTO questions (
    creator_username,
    question_text,
    reel_url,
    source_identifier,
    user_agent,
    referrer,
    user_id,
    created_at
) VALUES 
-- Questions for Alex Chen (Tech)
('alexchen', 'What programming language should I learn first as a complete beginner?', 'https://instagram.com/reel/abc123', 'instagram-story', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 'https://instagram.com', 'anonymous_user_1', NOW() - INTERVAL '2 days'),
('alexchen', 'How do you stay updated with the latest tech trends?', NULL, 'twitter-bio', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'https://twitter.com', 'anonymous_user_2', NOW() - INTERVAL '1 day'),
('alexchen', 'What''s your opinion on AI replacing developers?', 'https://tiktok.com/@user/video/123', 'tiktok-video', 'Mozilla/5.0 (Android 11; Mobile)', 'https://tiktok.com', 'anonymous_user_3', NOW() - INTERVAL '12 hours'),
('alexchen', 'Can you share your journey from junior to senior developer?', NOW() - INTERVAL '6 hours'),

-- Questions for Sarah Johnson (Fitness)
('sarahfitness', 'What''s the best workout routine for beginners?', NOW() - INTERVAL '3 days'),
('sarahfitness', 'How do you maintain motivation during tough times?', NOW() - INTERVAL '2 days'),
('sarahfitness', 'What are your thoughts on intermittent fasting?', NOW() - INTERVAL '1 day'),

-- Questions for Maya Rodriguez (Art)
('mayaart', 'What software do you recommend for digital art beginners?', NOW() - INTERVAL '4 days'),
('mayaart', 'How do you overcome creative blocks?', NOW() - INTERVAL '2 days'),
('mayaart', 'Can you share your artistic journey and inspirations?', NOW() - INTERVAL '8 hours'),

-- Questions for David Kim (Entrepreneur)
('davidkim', 'What''s the biggest mistake first-time entrepreneurs make?', NOW() - INTERVAL '5 days'),
('davidkim', 'How do you validate a business idea before investing time and money?', NOW() - INTERVAL '3 days'),
('davidkim', 'What advice would you give to someone afraid of taking risks?', NOW() - INTERVAL '1 day'),

-- Questions for Isabella Martinez (Chef)
('chefisabella', 'What''s your signature dish and the story behind it?', NOW() - INTERVAL '2 days'),
('chefisabella', 'How can home cooks improve their knife skills?', NOW() - INTERVAL '1 day'),
('chefisabella', 'What''s the most challenging dish you''ve ever prepared?', NOW() - INTERVAL '4 hours'),

-- Questions for Admin User (Test)
('admin192', 'How does this AMA platform work?', NOW() - INTERVAL '1 hour'),
('admin192', 'What features are you most excited about?', NOW() - INTERVAL '30 minutes');

-- =====================================================
-- 3. CHAT USERS (Sample Chat Participants)
-- =====================================================

INSERT INTO chat_users (
    auth_user_id,
    username,
    avatar_url,
    is_online,
    last_seen,
    created_at
) VALUES 
('user_tech_guru_123', 'alexchen', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', true, NOW(), NOW() - INTERVAL '30 days'),
('user_fitness_coach_456', 'sarahfitness', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', false, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '25 days'),
('user_artist_789', 'mayaart', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', true, NOW(), NOW() - INTERVAL '20 days'),
('user_entrepreneur_101', 'davidkim', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', false, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '15 days'),
('user_chef_202', 'chefisabella', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', true, NOW(), NOW() - INTERVAL '10 days'),
('user_34LJEmlrAJNBBOVihJdUEi9iYs0', 'admin192', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', true, NOW(), NOW() - INTERVAL '1 day'),
(NULL, 'guest_user_1', NULL, false, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '1 hour'),
(NULL, 'guest_user_2', NULL, true, NOW(), NOW() - INTERVAL '2 hours');

-- =====================================================
-- 4. ADDITIONAL CHAT ROOMS (Beyond the default public-general)
-- =====================================================

-- Note: We need to get the creator IDs from chat_users table first
-- These rooms will be created with proper UUID references

INSERT INTO chat_rooms (
    name,
    description,
    room_type,
    creator_id,
    created_at
) 
SELECT 
    'Tech Discussions',
    'A place for developers and tech enthusiasts to share knowledge',
    'public',
    cu.id,
    NOW() - INTERVAL '20 days'
FROM chat_users cu WHERE cu.username = 'alexchen'

UNION ALL

SELECT 
    'Fitness & Health',
    'Share your fitness journey and motivate each other',
    'public',
    cu.id,
    NOW() - INTERVAL '15 days'
FROM chat_users cu WHERE cu.username = 'sarahfitness'

UNION ALL

SELECT 
    'Creative Corner',
    'Artists, designers, and creative minds unite!',
    'public',
    cu.id,
    NOW() - INTERVAL '10 days'
FROM chat_users cu WHERE cu.username = 'mayaart'

UNION ALL

SELECT 
    'Startup Hub',
    'Entrepreneurs sharing ideas and experiences',
    'public',
    cu.id,
    NOW() - INTERVAL '8 days'
FROM chat_users cu WHERE cu.username = 'davidkim'

UNION ALL

SELECT 
    'Foodie Paradise',
    'Recipes, cooking tips, and culinary adventures',
    'public',
    cu.id,
    NOW() - INTERVAL '5 days'
FROM chat_users cu WHERE cu.username = 'chefisabella';

-- =====================================================
-- 5. CHAT MESSAGES (Sample Conversations)
-- =====================================================

-- Note: We'll use a simpler approach with hardcoded room names that we can reference
-- First, let's create some messages for existing rooms

-- Messages for public rooms (we'll need to get room IDs dynamically)
INSERT INTO chat_messages (
    room_id,
    sender_id,
    content,
    message_type,
    created_at
)
-- Get room and user IDs dynamically for sample messages
SELECT 
    cr.id as room_id,
    cu.id as sender_id,
    'Welcome everyone to the AMA platform! 👋' as content,
    'text' as message_type,
    NOW() - INTERVAL '2 hours' as created_at
FROM chat_rooms cr, chat_users cu 
WHERE cr.name = 'Tech Discussions' AND cu.username = 'alexchen'

UNION ALL

SELECT 
    cr.id,
    cu.id,
    'Excited to be here! Looking forward to connecting with everyone',
    'text',
    NOW() - INTERVAL '1 hour 45 minutes'
FROM chat_rooms cr, chat_users cu 
WHERE cr.name = 'Fitness & Health' AND cu.username = 'sarahfitness'

UNION ALL

SELECT 
    cr.id,
    cu.id,
    'This platform looks amazing! Can''t wait to share some art tips',
    'text',
    NOW() - INTERVAL '1 hour 30 minutes'
FROM chat_rooms cr, chat_users cu 
WHERE cr.name = 'Creative Corner' AND cu.username = 'mayaart'

UNION ALL

SELECT 
    cr.id,
    cu.id,
    'Great to see such a diverse community here!',
    'text',
    NOW() - INTERVAL '1 hour 15 minutes'
FROM chat_rooms cr, chat_users cu 
WHERE cr.name = 'Startup Hub' AND cu.username = 'davidkim'

UNION ALL

SELECT 
    cr.id,
    cu.id,
    'Anyone interested in cooking tips? I''m here to help! 👨‍🍳',
    'text',
    NOW() - INTERVAL '1 hour'
FROM chat_rooms cr, chat_users cu 
WHERE cr.name = 'Foodie Paradise' AND cu.username = 'chefisabella';

-- =====================================================
-- 6. QUESTION VIEWS (Sample View Tracking)
-- =====================================================

-- Note: This table doesn't exist in the current schema
-- Commenting out for now

-- INSERT INTO question_views (
--     question_id,
--     viewer_user_id,
--     viewed_at
-- ) 
-- SELECT 
--     q.id,
--     CASE 
--         WHEN random() < 0.3 THEN 'user_tech_guru_123'
--         WHEN random() < 0.5 THEN 'user_fitness_coach_456'
--         WHEN random() < 0.7 THEN 'user_artist_789'
--         WHEN random() < 0.9 THEN 'user_entrepreneur_101'
--         ELSE 'user_chef_202'
--     END,
--     q.created_at + (random() * INTERVAL '1 day')
-- FROM questions q
-- CROSS JOIN generate_series(1, floor(random() * 5 + 1)::int) -- Random 1-5 views per question
-- WHERE random() < 0.8; -- 80% chance each question gets views

-- =====================================================
-- 7. TYPING INDICATORS (Sample Active Typing)
-- =====================================================

INSERT INTO typing_indicators (
    room_id,
    user_id,
    started_at,
    expires_at
)
SELECT 
    cr.id as room_id,
    cu.id as user_id,
    NOW() - INTERVAL '30 seconds' as started_at,
    NOW() + INTERVAL '30 seconds' as expires_at
FROM chat_rooms cr, chat_users cu 
WHERE cr.name = 'Tech Discussions' AND cu.username = 'alexchen'

UNION ALL

SELECT 
    cr.id,
    cu.id,
    NOW() - INTERVAL '15 seconds',
    NOW() + INTERVAL '45 seconds'
FROM chat_rooms cr, chat_users cu 
WHERE cr.name = 'Creative Corner' AND cu.username = 'mayaart';

-- =====================================================
-- SAMPLE DATA IMPORT COMPLETE
-- =====================================================

-- Verify the data was inserted correctly
SELECT 'Creator Profiles' as table_name, COUNT(*) as record_count FROM creator_profiles
UNION ALL
SELECT 'Questions', COUNT(*) FROM questions
UNION ALL
SELECT 'Chat Users', COUNT(*) FROM chat_users
UNION ALL
SELECT 'Chat Rooms', COUNT(*) FROM chat_rooms
UNION ALL
SELECT 'Chat Messages', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'Typing Indicators', COUNT(*) FROM typing_indicators;

-- Show some sample data
SELECT 
    'Sample Creator Profiles:' as info,
    display_name,
    username,
    bio
FROM creator_profiles 
LIMIT 3;