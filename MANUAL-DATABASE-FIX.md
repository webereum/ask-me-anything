# Manual Database Schema Fix Required

## Issue
The `creator_profiles` table has a `user_id` column of type `UUID`, but Clerk provides user IDs as `TEXT` strings. This causes the "Create AMA" functionality to fail with the error:
```
invalid input syntax for type uuid: "clerk_user_id"
```

## Solution
You need to manually fix the database schema in your Supabase Dashboard:

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `zldkcbttriyjphibgqnh`
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Schema Fix
Copy and paste this SQL command in the SQL Editor and click **Run**:

```sql
-- Change user_id column from UUID to TEXT
ALTER TABLE creator_profiles ALTER COLUMN user_id TYPE TEXT;

-- Update RLS policies to work with TEXT user_id
DROP POLICY IF EXISTS "Users can view all creator profiles" ON creator_profiles;
DROP POLICY IF EXISTS "Users can insert their own creator profile" ON creator_profiles;
DROP POLICY IF EXISTS "Users can update their own creator profile" ON creator_profiles;

-- Recreate RLS policies with proper TEXT casting
CREATE POLICY "Users can view all creator profiles" ON creator_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own creator profile" ON creator_profiles
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own creator profile" ON creator_profiles
    FOR UPDATE USING (auth.uid()::TEXT = user_id);
```

### Step 3: Verify the Fix
After running the SQL, the "Create AMA" functionality should work properly.

## Alternative: Quick Test
If you want to test without the manual fix, you can temporarily modify the Create AMA form to use a UUID-compatible format, but the manual database fix is the proper solution.