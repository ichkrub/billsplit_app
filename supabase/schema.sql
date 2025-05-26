-- Create anonymous_splits table
CREATE TABLE anonymous_splits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  people JSONB NOT NULL,
  items JSONB NOT NULL,
  tax_percent FLOAT NOT NULL DEFAULT 0,
  service_fee FLOAT NOT NULL DEFAULT 0,
  discount FLOAT NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'amount')),
  currency TEXT NOT NULL,
  bill_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on created_at for faster queries
CREATE INDEX idx_anonymous_splits_created_at ON anonymous_splits(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE anonymous_splits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts
CREATE POLICY "Allow anonymous inserts"
  ON anonymous_splits
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow anonymous selects
CREATE POLICY "Allow anonymous selects"
  ON anonymous_splits
  FOR SELECT
  TO anon
  USING (true); 