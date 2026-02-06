import type { Database } from "@/integrations/supabase/types";

export type PlatformType = Database["public"]["Enums"]["platform_type"];

export interface SavedItem {
  id: string;
  title: string;
  url: string;
  platform: PlatformType;
  thumbnail?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  summary?: string;
  aiTags?: string[];
  ogImage?: string;
  ogDescription?: string;
  favicon?: string;
  reminderAt?: Date;
  isHighlighted: boolean;
  collectionId?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isSmart: boolean;
  isPublic: boolean;
  shareSlug?: string;
  createdAt: Date;
}

export const mapSavedLink = (link: Database["public"]["Tables"]["saved_links"]["Row"]): SavedItem => ({
  id: link.id,
  title: link.title,
  url: link.url,
  platform: link.platform,
  thumbnail: link.thumbnail || undefined,
  notes: link.notes || undefined,
  tags: link.tags || [],
  createdAt: new Date(link.created_at),
  summary: (link as any).summary || undefined,
  aiTags: (link as any).ai_tags || [],
  ogImage: (link as any).og_image || undefined,
  ogDescription: (link as any).og_description || undefined,
  favicon: (link as any).favicon || undefined,
  reminderAt: (link as any).reminder_at ? new Date((link as any).reminder_at) : undefined,
  isHighlighted: (link as any).is_highlighted || false,
  collectionId: (link as any).collection_id || undefined,
});
