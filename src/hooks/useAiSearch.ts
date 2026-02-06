import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AiSearchResult {
  answer: string;
  matchedIds: string[];
}

export const useAiSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AiSearchResult | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { query },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setResult({
        answer: data.answer,
        matchedIds: data.matchedIds || [],
      });
    } catch (error) {
      console.error("AI search error:", error);
      toast.error("AI search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearResult = () => setResult(null);

  return { isSearching, result, search, clearResult };
};
