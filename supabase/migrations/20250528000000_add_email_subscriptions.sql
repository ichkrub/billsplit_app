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
