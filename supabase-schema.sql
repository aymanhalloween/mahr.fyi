-- Enhanced Mahr Submissions Table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Asset Information
  asset_type TEXT NOT NULL CHECK (asset_type IN ('cash', 'gold', 'jewelry', 'property', 'stocks', 'crypto', 'business', 'mixed', 'other')),
  
  -- Flexible amount handling
  cash_amount NUMERIC, -- For cash amounts
  cash_currency TEXT DEFAULT 'USD', -- Currency for cash
  
  -- For non-cash assets
  asset_description TEXT, -- "2oz gold", "100 shares Apple", "2BR apartment"
  estimated_value NUMERIC, -- Estimated value in USD
  estimated_value_currency TEXT DEFAULT 'USD',
  
  -- Location & Demographics
  location TEXT NOT NULL,
  country_code TEXT, -- For mapping (we'll populate this)
  region TEXT, -- Middle East, South Asia, etc.
  
  -- Background
  cultural_background TEXT,
  profession TEXT,
  marriage_year INTEGER,
  
  -- Context
  story TEXT,
  family_pressure_level INTEGER CHECK (family_pressure_level BETWEEN 1 AND 5), -- 1=none, 5=high
  negotiated BOOLEAN DEFAULT false, -- Was amount negotiated?
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_year CHECK (marriage_year >= 1950 AND marriage_year <= EXTRACT(YEAR FROM NOW()) + 1),
  CONSTRAINT has_value CHECK (
    (asset_type = 'cash' AND cash_amount IS NOT NULL) OR 
    (asset_type != 'cash' AND estimated_value IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_submissions_asset_type ON submissions(asset_type);
CREATE INDEX idx_submissions_country ON submissions(country_code);
CREATE INDEX idx_submissions_year ON submissions(marriage_year);
CREATE INDEX idx_submissions_created ON submissions(created_at);

-- Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON submissions 
FOR INSERT TO anon 
WITH CHECK (true);

-- Allow authenticated reads (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON submissions 
FOR SELECT TO authenticated 
USING (true);

-- Optional: Create a view for analytics
CREATE VIEW submission_analytics AS
SELECT 
  asset_type,
  country_code,
  region,
  marriage_year,
  CASE 
    WHEN asset_type = 'cash' THEN cash_amount
    ELSE estimated_value 
  END as normalized_value,
  CASE 
    WHEN asset_type = 'cash' THEN cash_currency
    ELSE estimated_value_currency 
  END as currency,
  cultural_background,
  family_pressure_level,
  negotiated,
  created_at
FROM submissions
WHERE created_at >= NOW() - INTERVAL '5 years'; -- Only recent data for trends 