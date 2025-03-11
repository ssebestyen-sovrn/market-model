-- Create analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own analyses
CREATE POLICY "Users can view their own analyses" 
  ON analyses FOR SELECT 
  USING (auth.uid() = user_id);

-- Only allow users to insert their own analyses
CREATE POLICY "Users can insert their own analyses" 
  ON analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own analyses
CREATE POLICY "Users can update their own analyses" 
  ON analyses FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_analyses_updated_at
BEFORE UPDATE ON analyses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 