-- Add a new short_id column
ALTER TABLE anonymous_splits 
  ADD COLUMN short_id char(8);

-- Add a unique constraint to ensure no duplicate short IDs
ALTER TABLE anonymous_splits 
  ADD CONSTRAINT anonymous_splits_short_id_unique UNIQUE (short_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS anonymous_splits_short_id_idx ON anonymous_splits (short_id);
