import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SavedItem, PlatformType } from "@/types/saved-item";
import { mapSavedLink } from "@/types/saved-item";

export const useSavedLinks = (userId: string | undefined) => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [showHighlightsOnly, setShowHighlightsOnly] = useState(false);

  // Fetch saved links
  useEffect(() => {
    const fetchLinks = async () => {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from("saved_links")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setItems((data || []).map(mapSavedLink));
      } catch (error) {
        console.error("Error fetching links:", error);
        toast.error("Failed to load your saved links");
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) fetchLinks();
  }, [userId]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.aiTags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlatform =
        selectedPlatforms.length === 0 || selectedPlatforms.includes(item.platform);

      const matchesCollection =
        !selectedCollection || item.collectionId === selectedCollection;

      const matchesHighlight = !showHighlightsOnly || item.isHighlighted;

      return matchesSearch && matchesPlatform && matchesCollection && matchesHighlight;
    });
  }, [items, searchQuery, selectedPlatforms, selectedCollection, showHighlightsOnly]);

  const addItem = async (newItem: Omit<SavedItem, "id" | "createdAt" | "isHighlighted">) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("saved_links")
        .insert({
          user_id: userId,
          title: newItem.title,
          url: newItem.url,
          platform: newItem.platform,
          thumbnail: newItem.thumbnail || null,
          notes: newItem.notes || null,
          tags: newItem.tags,
        })
        .select()
        .single();
      if (error) throw error;
      const item = mapSavedLink(data);
      setItems((prev) => [item, ...prev]);
      toast.success("Link saved!", { description: "AI is enriching your link..." });

      // Trigger async enrichment
      supabase.functions
        .invoke("enrich-link", {
          body: { url: newItem.url, linkId: data.id },
        })
        .then(({ data: enrichData }) => {
          if (enrichData?.success && enrichData.data) {
            const d = enrichData.data;
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      title: d.title || i.title,
                      ogImage: d.og_image || i.ogImage,
                      thumbnail: d.og_image || i.thumbnail,
                      ogDescription: d.og_description || i.ogDescription,
                      favicon: d.favicon || i.favicon,
                      summary: d.summary || i.summary,
                      aiTags: d.ai_tags || i.aiTags,
                    }
                  : i
              )
            );
            toast.success("Link enriched!", { description: "AI added summary & tags" });
          }
        })
        .catch((err) => console.error("Enrichment failed:", err));

      return item;
    } catch (error) {
      console.error("Error saving link:", error);
      toast.error("Failed to save link");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_links")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Link deleted");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
    }
  };

  const toggleHighlight = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newVal = !item.isHighlighted;
    try {
      const { error } = await supabase
        .from("saved_links")
        .update({ is_highlighted: newVal } as any)
        .eq("id", id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isHighlighted: newVal } : i))
      );
      toast.success(newVal ? "Highlighted!" : "Removed highlight");
    } catch (error) {
      console.error("Error toggling highlight:", error);
    }
  };

  const setReminder = async (id: string, date: Date | null) => {
    try {
      const { error } = await supabase
        .from("saved_links")
        .update({ reminder_at: date?.toISOString() || null } as any)
        .eq("id", id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, reminderAt: date || undefined } : i
        )
      );
      toast.success(date ? "Reminder set!" : "Reminder removed");
    } catch (error) {
      console.error("Error setting reminder:", error);
    }
  };

  const moveToCollection = async (id: string, collectionId: string | null) => {
    try {
      const { error } = await supabase
        .from("saved_links")
        .update({ collection_id: collectionId } as any)
        .eq("id", id);
      if (error) throw error;
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, collectionId: collectionId || undefined } : i
        )
      );
    } catch (error) {
      console.error("Error moving to collection:", error);
    }
  };

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  return {
    items,
    filteredItems,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedPlatforms,
    handlePlatformToggle,
    selectedCollection,
    setSelectedCollection,
    showHighlightsOnly,
    setShowHighlightsOnly,
    addItem,
    deleteItem,
    toggleHighlight,
    setReminder,
    moveToCollection,
  };
};
