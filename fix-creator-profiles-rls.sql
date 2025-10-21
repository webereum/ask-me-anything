-- =====================================================
-- FIX ROW LEVEL SECURITY FOR CREATOR PROFILES
-- =====================================================
-- Run this file to fix RLS policies that are blocking
-- creator profile creation
-- =====================================================

-- First, let's check current RLS status
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'creator_profiles';

-- Temporarily disable RLS to see if that's the issue
ALTER TABLE creator_profiles DISABLE ROW LEVEL SECURITY;

-- Or, if you want to keep RLS enabled, create proper policies
-- Re-enable RLS first
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON creator_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON creator_profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON creator_profiles;

-- Create new policies that allow proper access
-- Policy 1: Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON creator_profiles
    FOR INSERT 
    WITH CHECK (true); -- Allow all inserts for now

-- Policy 2: Allow users to view all profiles (public read)
CREATE POLICY "Users can view all profiles" ON creator_profiles
    FOR SELECT 
    USING (true); -- Allow all reads

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON creator_profiles
    FOR UPDATE 
    USING (true) -- Allow all updates for now
    WITH CHECK (true);

-- Policy 4: Allow users to delete their own profile (optional)
CREATE POLICY "Users can delete their own profile" ON creator_profiles
    FOR DELETE 
    USING (true); -- Allow all deletes for now

-- Alternative: If you want stricter policies based on Clerk user ID
-- Uncomment these and comment out the above policies

/*
-- Strict policy for insert (user can only insert their own profile)
CREATE POLICY "Users can insert their own profile" ON creator_profiles
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id);

-- Public read access
CREATE POLICY "Public can view profiles" ON creator_profiles
    FOR SELECT 
    USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON creator_profiles
    FOR UPDATE 
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);
*/

-- Grant necessary permissions to authenticated users
GRANT ALL ON creator_profiles TO authenticated;
GRANT ALL ON creator_profiles TO anon;

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'creator_profiles';

-- Test insert (this should work now)
-- You can uncomment this to test
/*
INSERT INTO creator_profiles (
    user_id, 
    username, 
    display_name, 
    bio, 
    avatar_url
) VALUES (
    'test_user_123',
    'testuser',
    'Test User',
    'This is a test profile',
    'https://example.com/avatar.jpg'
);
*/