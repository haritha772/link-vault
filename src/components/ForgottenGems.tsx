import { useMemo, useState } from "react";
import { Gem, ChevronRight, ChevronDown, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import SavedCard from "@/components/SavedCard";
import type { SavedItem } from "@/types/saved-item";

interface ForgottenGemsProps {
  items: SavedItem[];
  onDelete?: (id: string) => void;
  onToggleHighlight?: (id: string) => void;
}

const ForgottenGems = ({ items, onDelete, onToggleHighlight }: ForgottenGemsProps) => {
  const [expanded, setExpanded] = useState(false);

  const forgottenItems = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return items.filter((item) => {
      const isForgotten = item.createdAt < thirtyDaysAgo;
      return isForgotten;
    });
  }, [items]);

  if (forgottenItems.length === 0) return null;

  return (
    <div className="mb-8 animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-primary/[0.06] to-accent/[0.03] border border-primary/15 rounded-xl hover:from-primary/[0.1] hover:to-accent/[0.06] transition-all duration-300 group"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Gem className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-display text-base font-semibold text-foreground">
            Forgotten Gems
          </h3>
          <p className="text-xs text-muted-foreground">
            {forgottenItems.length} item{forgottenItems.length !== 1 ? "s" : ""} saved 30+ days ago — rediscover them!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {forgottenItems.length}
          </span>
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 animate-scale-in">
          {forgottenItems.slice(0, 6).map((item) => (
            <div key={item.id} className="relative">
              <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                <Clock className="w-2.5 h-2.5" />
                {Math.floor((Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24))}d ago
              </div>
              <SavedCard
                item={item}
                onDelete={onDelete}
                onToggleHighlight={onToggleHighlight}
              />
            </div>
          ))}
        </div>
      )}

      {expanded && forgottenItems.length > 6 && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          +{forgottenItems.length - 6} more forgotten gems
        </p>
      )}
    </div>
  );
};

export default ForgottenGems;
