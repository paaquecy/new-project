/*
  # Storage Setup for Evidence Files

  1. Storage Buckets
    - `evidence` - For violation evidence (photos, videos)
    - `documents` - For official documents
    - `profiles` - For user profile pictures

  2. Storage Policies
    - Allow authenticated users to upload files
    - Allow public read access to evidence files
    - Secure access based on user roles
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('evidence', 'evidence', true),
  ('documents', 'documents', false),
  ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for evidence bucket
CREATE POLICY "Allow authenticated uploads to evidence"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'evidence');

CREATE POLICY "Allow public read access to evidence"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'evidence');

CREATE POLICY "Allow authenticated users to update own evidence"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'evidence' AND auth.uid()::text = owner::text);

CREATE POLICY "Allow authenticated users to delete own evidence"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'evidence' AND auth.uid()::text = owner::text);

-- Create storage policies for documents bucket
CREATE POLICY "Allow authenticated uploads to documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated read access to documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

-- Create storage policies for profiles bucket
CREATE POLICY "Allow authenticated uploads to profiles"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profiles');

CREATE POLICY "Allow public read access to profiles"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profiles');