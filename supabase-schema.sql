-- Supabase Database Schema for Meredith's Portfolio
-- Run this in the Supabase SQL Editor

-- Create portfolio_sections table
CREATE TABLE portfolio_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  header TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for ordering
CREATE INDEX idx_portfolio_sections_order ON portfolio_sections(order_index);

-- Enable Row Level Security
ALTER TABLE portfolio_sections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading for everyone
CREATE POLICY "Allow public read access" 
ON portfolio_sections FOR SELECT 
USING (true);

-- Create policy to allow insert/update/delete only for authenticated users
CREATE POLICY "Allow authenticated insert" 
ON portfolio_sections FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update" 
ON portfolio_sections FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated delete" 
ON portfolio_sections FOR DELETE 
TO authenticated 
USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_portfolio_sections_updated_at 
BEFORE UPDATE ON portfolio_sections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Optional: Insert sample data
-- Uncomment if you want some starter sections

INSERT INTO portfolio_sections (header, content, order_index) VALUES
  ('Projects', 'I''ve built scalable web applications that serve thousands of users daily. My focus is on creating intuitive interfaces that solve real problems.', 1),
  ('Technical Skills', 'Frontend: React, Next.js, TypeScript, CSS-in-JS<br>Backend: Node.js, PostgreSQL, Supabase<br>Tools: Git, Figma, VS Code', 2),
  ('Contact', 'Let''s build something amazing together. Reach out via <a href="mailto:your@email.com">email</a> or connect with me on social media.', 3);
