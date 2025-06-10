-- Fix RLS policies for anonymous submissions

-- First, disable RLS temporarily to clear any issues
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous inserts" ON submissions;
DROP POLICY IF EXISTS "Allow authenticated reads" ON submissions;

-- Create a more permissive policy for anonymous inserts
CREATE POLICY "Enable insert for anonymous users" ON submissions
FOR INSERT TO anon
WITH CHECK (true);

-- Allow all users to read submissions (since this is public data)
CREATE POLICY "Enable read access for all users" ON submissions
FOR SELECT TO anon, authenticated
USING (true);

-- Optional: Allow public read access without authentication
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT ON submissions TO anon;
GRANT SELECT ON submissions TO anon;
GRANT USAGE ON SCHEMA public TO anon; 