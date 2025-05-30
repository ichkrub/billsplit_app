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