-- Add vendor_name column to anonymous_splits table
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'anonymous_splits' 
        AND column_name = 'vendor_name'
    ) THEN
        ALTER TABLE anonymous_splits ADD COLUMN vendor_name TEXT;
    END IF;
END $$;
