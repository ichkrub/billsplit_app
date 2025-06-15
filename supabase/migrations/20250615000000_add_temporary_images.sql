-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create storage bucket for temporary receipt images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('temp_receipts', 'temp_receipts', true)
ON CONFLICT (id) DO NOTHING;

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

-- Alternative cleanup using a trigger-based approach since pg_cron might not be available
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
