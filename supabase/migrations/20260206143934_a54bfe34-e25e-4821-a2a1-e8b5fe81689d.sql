
-- Add enrichment & feature columns to saved_links
ALTER TABLE public.saved_links
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS favicon TEXT,
  ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS collection_id UUID;

-- Create collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#FF6B35',
  icon TEXT NOT NULL DEFAULT 'folder',
  is_smart BOOLEAN NOT NULL DEFAULT false,
  smart_criteria JSONB,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_collections_user_id ON public.collections(user_id);
CREATE INDEX idx_saved_links_collection_id ON public.saved_links(collection_id);
CREATE INDEX idx_saved_links_reminder_at ON public.saved_links(reminder_at);
CREATE INDEX idx_saved_links_is_highlighted ON public.saved_links(is_highlighted);

-- Add foreign key for collection_id
ALTER TABLE public.saved_links
  ADD CONSTRAINT fk_saved_links_collection
  FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE SET NULL;

-- Enable RLS on collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Collections RLS policies
CREATE POLICY "Users can view their own collections"
  ON public.collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public collections"
  ON public.collections FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for collections updated_at
CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
