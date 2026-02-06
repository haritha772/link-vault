import { useState, useRef } from "react";
import { Sparkles, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AiSearchBarProps {
  isSearching: boolean;
  result: { answer: string; matchedIds: string[] } | null;
  onSearch: (query: string) => void;
  onClear: () => void;
}

const AiSearchBar = ({ isSearching, result, onSearch, onClear }: AiSearchBarProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask AI: 'find that recipe I saved last week'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 bg-primary/[0.03] border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
          {result && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setQuery("");
                onClear();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <Button type="submit" disabled={isSearching || !query.trim()} size="sm" className="gap-1.5">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Ask AI
          </Button>
        </div>
      </form>

      {/* AI Answer */}
      {result && (
        <div className="mt-3 p-4 bg-primary/[0.04] border border-primary/15 rounded-xl animate-scale-in">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-foreground leading-relaxed">{result.answer}</p>
              {result.matchedIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Found {result.matchedIds.length} matching link{result.matchedIds.length > 1 ? "s" : ""} highlighted below
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSearchBar;
