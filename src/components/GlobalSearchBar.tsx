import { useState, useRef, useEffect } from "react";
import { Search, X, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import PlatformIcon from "@/components/PlatformIcon";
import type { SavedItem } from "@/types/saved-item";

interface GlobalSearchBarProps {
  items: SavedItem[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const GlobalSearchBar = ({ items, searchQuery, onSearchChange }: GlobalSearchBarProps) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Quick suggestions based on current query
  const suggestions = searchQuery.length >= 2
    ? items
        .filter((item) => {
          const q = searchQuery.toLowerCase();
          return (
            item.title.toLowerCase().includes(q) ||
            item.tags.some((t) => t.toLowerCase().includes(q)) ||
            (item.aiTags || []).some((t) => t.toLowerCase().includes(q)) ||
            item.platform.includes(q) ||
            item.summary?.toLowerCase().includes(q) ||
            item.notes?.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className={`relative transition-all duration-300 ${focused ? "scale-[1.02]" : ""}`}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search by title, tag, platform, keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setFocused(true)}
          className="pl-12 pr-10 h-12 text-base bg-card border-border/60 rounded-xl shadow-sm focus-visible:ring-primary/30 focus-visible:border-primary/40"
        />
        {searchQuery && (
          <button
            onClick={() => {
              onSearchChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Live suggestions dropdown */}
      {focused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-scale-in">
          {suggestions.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
              onClick={() => {
                onSearchChange(item.title);
                setFocused(false);
              }}
            >
              <PlatformIcon platform={item.platform} size={16} className="text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.platform} {item.tags.length > 0 && `• ${item.tags.slice(0, 2).join(", ")}`}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
