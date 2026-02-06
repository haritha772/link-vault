import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Collection } from "@/types/saved-item";

export const useCollections = (userId: string | undefined) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!userId) return;
      try {
        const { data, error } = await supabase
          .from("collections")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setCollections(
          (data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description || undefined,
            color: c.color,
            icon: c.icon,
            isSmart: c.is_smart,
            isPublic: c.is_public,
            shareSlug: c.share_slug || undefined,
            createdAt: new Date(c.created_at),
          }))
        );
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) fetchCollections();
  }, [userId]);

  const createCollection = async (name: string, color: string = "#FF6B35") => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("collections")
        .insert({ user_id: userId, name, color } as any)
        .select()
        .single();
      if (error) throw error;
      const collection: Collection = {
        id: data.id,
        name: data.name,
        description: (data as any).description || undefined,
        color: (data as any).color,
        icon: (data as any).icon,
        isSmart: (data as any).is_smart,
        isPublic: (data as any).is_public,
        shareSlug: (data as any).share_slug || undefined,
        createdAt: new Date(data.created_at),
      };
      setCollections((prev) => [collection, ...prev]);
      toast.success("Collection created!");
      return collection;
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection");
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast.success("Collection deleted");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection");
    }
  };

  return { collections, isLoading, createCollection, deleteCollection };
};
