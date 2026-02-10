
-- Add view_count to saved_links for analytics
ALTER TABLE public.saved_links ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Allow anyone (even unauthenticated) to view links in public collections
CREATE POLICY "Anyone can view links in public collections"
ON public.saved_links
FOR SELECT
USING (
  collection_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = saved_links.collection_id AND c.is_public = true
  )
);
