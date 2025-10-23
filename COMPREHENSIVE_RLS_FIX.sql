-- Comprehensive RLS Policy Fix for user_language_pairs
-- Run this in the Supabase Dashboard SQL Editor

-- First, let's check if RLS is enabled and what policies exist
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_language_pairs';

-- Drop all existing policies on the table
DROP POLICY IF EXISTS "Users can manage their own language pairs" ON user_language_pairs;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON user_language_pairs;

-- Create comprehensive policies for all operations
CREATE POLICY "Users can view their own language pairs" ON user_language_pairs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own language pairs" ON user_language_pairs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own language pairs" ON user_language_pairs
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own language pairs" ON user_language_pairs
FOR DELETE USING (auth.uid() = user_id);

-- Verify the policies were created
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies WHERE tablename = 'user_language_pairs';
