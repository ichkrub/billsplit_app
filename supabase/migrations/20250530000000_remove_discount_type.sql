-- First make the column nullable
ALTER TABLE IF EXISTS anonymous_splits ALTER COLUMN discount_type DROP NOT NULL;

-- Update existing rows to use 'amount' as discount_type
UPDATE anonymous_splits SET discount_type = 'amount' WHERE discount_type IS NULL;

-- Then remove the column
ALTER TABLE IF EXISTS anonymous_splits DROP COLUMN discount_type;
