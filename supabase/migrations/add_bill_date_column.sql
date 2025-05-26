-- Check if bill_date column exists and add it if it doesn't
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'anonymous_splits' 
        AND column_name = 'bill_date'
    ) THEN
        ALTER TABLE anonymous_splits ADD COLUMN bill_date DATE;
    END IF;
END $$;
