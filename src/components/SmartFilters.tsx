import { useState } from "react";
import { Filter, ShoppingCart, BookOpen, Play, Eye, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PlatformIcon from "@/components/PlatformIcon";
import type { PlatformType } from "@/types/saved-item";

export type IntentType = "buy" | "learn" | "watch" | "read" | "all";

interface SmartFiltersProps {
  selectedPlatforms: string[];
  onPlatformToggle: (platform: string) => void;
  selectedIntent: IntentType;
  onIntentChange: (intent: IntentType) => void;
  showHighlightsOnly: boolean;
  onToggleHighlights: (val: boolean) => void;
  totalItems: number;
  filteredCount: number;
}

const platforms: { id: PlatformType; label: string }[] = [
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
  { id: "twitter", label: "Twitter" },
  { id: "shopping", label: "Shopping" },
  { id: "article", label: "Articles" },
  { id: "other", label: "Other" },
];

const intents: { id: IntentType; label: string; icon: React.ReactNode; keywords: string[] }[] = [
  { id: "buy", label: "Buy", icon: <ShoppingCart className="w-3.5 h-3.5" />, keywords: ["buy", "price", "deal", "shop", "cart", "order"] },
  { id: "learn", label: "Learn", icon: <BookOpen className="w-3.5 h-3.5" />, keywords: ["tutorial", "guide", "how", "learn", "course"] },
  { id: "watch", label: "Watch", icon: <Play className="w-3.5 h-3.5" />, keywords: ["video", "watch", "stream", "episode"] },
  { id: "read", label: "Read", icon: <Eye className="w-3.5 h-3.5" />, keywords: ["article", "blog", "read", "news", "story"] },
];

const SmartFilters = ({
  selectedPlatforms,
  onPlatformToggle,
  selectedIntent,
  onIntentChange,
  showHighlightsOnly,
  onToggleHighlights,
  totalItems,
  filteredCount,
}: SmartFiltersProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasActiveFilters = selectedPlatforms.length > 0 || selectedIntent !== "all" || showHighlightsOnly;

  const clearAll = () => {
    selectedPlatforms.forEach(p => onPlatformToggle(p));
    onIntentChange("all");
    onToggleHighlights(false);
  };

  return (
    <div className="space-y-3">
      {/* Toggle bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={expanded ? "default" : "outline"}
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-1.5"
        >
          <Filter className="w-3.5 h-3.5" />
          Smart Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-primary-foreground text-primary text-xs flex items-center justify-center font-bold">
              {selectedPlatforms.length + (selectedIntent !== "all" ? 1 : 0) + (showHighlightsOnly ? 1 : 0)}
            </span>
          )}
        </Button>

        {/* Quick intent chips (always visible) */}
        {intents.map((intent) => (
          <button
            key={intent.id}
            onClick={() => onIntentChange(selectedIntent === intent.id ? "all" : intent.id)}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
              selectedIntent === intent.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {intent.icon}
            {intent.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <div className="p-4 bg-card border border-border rounded-xl animate-scale-in space-y-4">
          {/* Platform filter */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Platform</p>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => onPlatformToggle(platform.id)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                    selectedPlatforms.includes(platform.id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/50 text-secondary-foreground border-border hover:border-primary/30"
                  }`}
                >
                  <PlatformIcon platform={platform.id} size={12} />
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          {/* Highlights filter */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Special</p>
            <button
              onClick={() => onToggleHighlights(!showHighlightsOnly)}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                showHighlightsOnly
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/50 text-secondary-foreground border-border hover:border-primary/30"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Highlights only
            </button>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {filteredCount} of {totalItems} items
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartFilters;
