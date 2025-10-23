-- Fix RLS policy for user_language_pairs table
-- Run this in the Supabase Dashboard SQL Editor

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can manage their own language pairs" ON user_language_pairs;

-- Create a more permissive policy for now (we can tighten it later)
CREATE POLICY "Enable all operations for authenticated users" ON user_language_pairs
FOR ALL USING (auth.uid() IS NOT NULL);

-- Alternative: More specific policy if the above doesn't work
-- CREATE POLICY "Users can manage their own language pairs" ON user_language_pairs
-- FOR ALL USING (auth.uid() = user_id);
