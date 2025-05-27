-- Enable RLS
ALTER TABLE anonymous_splits ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting new splits (anyone can create)
CREATE POLICY "Enable insert for anonymous users" ON anonymous_splits
  FOR INSERT WITH CHECK (true);

-- Create policy for reading splits (anyone can read if they have the ID)
CREATE POLICY "Enable read access for splits" ON anonymous_splits
  FOR SELECT USING (true);

-- Create policy for updating splits (anyone can update if they have the ID)
-- In a real production app, you might want to add password protection here
CREATE POLICY "Enable update for splits" ON anonymous_splits
  FOR UPDATE USING (true);
