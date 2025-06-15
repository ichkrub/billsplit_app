-- Create anonymous_splits table
CREATE TABLE anonymous_splits (
  id UUID DEFAULT gen_random_uuid(),
  short_id CHAR(8),
  people JSONB NOT NULL,
  items JSONB NOT NULL,
  tax_amount FLOAT NOT NULL DEFAULT 0,
  service_amount FLOAT NOT NULL DEFAULT 0,
  discount FLOAT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL,
  vendor_name TEXT,
  bill_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  password TEXT,
  CONSTRAINT anonymous_splits_pkey PRIMARY KEY (id),
  CONSTRAINT anonymous_splits_short_id_unique UNIQUE (short_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_anonymous_splits_created_at ON anonymous_splits(created_at);
CREATE INDEX IF NOT EXISTS anonymous_splits_short_id_idx ON anonymous_splits(short_id);

-- Enable Row Level Security (RLS)
ALTER TABLE anonymous_splits ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Enable anonymous inserts" ON anonymous_splits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable anonymous reads" ON anonymous_splits
  FOR SELECT USING (true);

CREATE POLICY "Enable anonymous updates" ON anonymous_splits
  FOR UPDATE USING (true);

-- Create email_subscriptions table
CREATE TABLE email_subscriptions (
  id UUID DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  source TEXT, -- e.g., 'cta', 'footer', etc.
  ip_address TEXT,
  user_agent TEXT,
  CONSTRAINT email_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT email_subscriptions_email_unique UNIQUE (email)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);

-- Enable Row Level Security (RLS)
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous inserts only
CREATE POLICY "Enable anonymous inserts for email subscriptions" ON email_subscriptions
  FOR INSERT WITH CHECK (true);

-- No select/update/delete policies needed since this is insert-only for public access

-- Initialize storage for temporary receipts
-- Enable the pg_cron extension if available
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Skipping pg_cron extension - insufficient privileges';
END $$;

-- Enable storage by creating extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for temporary receipt images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('temp_receipts', 'temp_receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for temporary receipts
BEGIN;
  -- Allow public upload access to temp_receipts bucket
  CREATE POLICY "Allow public uploads to temp_receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'temp_receipts');

  -- Allow public read access to temp_receipts bucket
  CREATE POLICY "Allow public read from temp_receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'temp_receipts');

  -- Allow public update access to temp_receipts bucket
  CREATE POLICY "Allow public update in temp_receipts"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'temp_receipts');

  -- Allow public delete access to temp_receipts bucket
  CREATE POLICY "Allow public delete from temp_receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'temp_receipts');
COMMIT;

-- Create storage policy to allow public access to temp_receipts bucket
DROP POLICY IF EXISTS "Give public access to temp_receipts" ON storage.objects;
CREATE POLICY "Give public access to temp_receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'temp_receipts');

DROP POLICY IF EXISTS "Allow public uploads to temp_receipts" ON storage.objects;
CREATE POLICY "Allow public uploads to temp_receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'temp_receipts');

-- Function to clean up old temporary receipt images (older than 5 days)
CREATE OR REPLACE FUNCTION cleanup_temp_receipts()
RETURNS void AS $$
BEGIN
  -- Delete objects older than 5 days
  DELETE FROM storage.objects
  WHERE bucket_id = 'temp_receipts'
    AND created_at < NOW() - INTERVAL '5 days';
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cleanup on insert
CREATE OR REPLACE FUNCTION check_temp_receipts()
RETURNS trigger AS $$
BEGIN
  -- Delete old files when inserting new ones
  DELETE FROM storage.objects
  WHERE bucket_id = 'temp_receipts'
    AND created_at < NOW() - INTERVAL '5 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to run cleanup on each insert
DROP TRIGGER IF EXISTS trigger_cleanup_temp_receipts ON storage.objects;
CREATE TRIGGER trigger_cleanup_temp_receipts
  BEFORE INSERT ON storage.objects
  FOR EACH STATEMENT
  EXECUTE FUNCTION check_temp_receipts();

-- Create temporary_receipts table to track uploaded files
CREATE TABLE temporary_receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for cleanup
CREATE INDEX idx_temporary_receipts_expires_at ON temporary_receipts(expires_at);

-- Enable RLS
ALTER TABLE temporary_receipts ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access
CREATE POLICY "Enable anonymous inserts for temporary_receipts" ON temporary_receipts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable anonymous reads for temporary_receipts" ON temporary_receipts
  FOR SELECT USING (true);

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_receipts()
RETURNS void AS $$
BEGIN
  DELETE FROM temporary_receipts
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run cleanup periodically
CREATE OR REPLACE FUNCTION check_expired_receipts()
RETURNS trigger AS $$
BEGIN
  -- Clean up expired receipts when inserting new ones
  DELETE FROM temporary_receipts
  WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_expired_receipts ON temporary_receipts;
CREATE TRIGGER trigger_cleanup_expired_receipts
  BEFORE INSERT ON temporary_receipts
  FOR EACH STATEMENT
  EXECUTE FUNCTION check_expired_receipts();