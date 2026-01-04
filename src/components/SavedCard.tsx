import { ExternalLink, MoreVertical, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from "@/integrations/supabase/types";

type PlatformType = Database["public"]["Enums"]["platform_type"];

export interface SavedItem {
  id: string;
  title: string;
  url: string;
  platform: PlatformType;
  thumbnail?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
}

interface SavedCardProps {
  item: SavedItem;
  onEdit?: (item: SavedItem) => void;
  onDelete?: (id: string) => void;
}

const platformConfig: Record<PlatformType, { color: string; label: string }> = {
  instagram: { color: "bg-platform-instagram", label: "Instagram" },
  youtube: { color: "bg-platform-youtube", label: "YouTube" },
  twitter: { color: "bg-platform-twitter", label: "Twitter" },
  shopping: { color: "bg-platform-shopping", label: "Shopping" },
  article: { color: "bg-platform-article", label: "Article" },
  other: { color: "bg-platform-other", label: "Other" },
};

const SavedCard = ({ item, onEdit, onDelete }: SavedCardProps) => {
  const config = platformConfig[item.platform];

  return (
    <article className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/20 hover:shadow-md transition-all duration-300">
      {/* Thumbnail */}
      {item.thumbnail ? (
        <div className="aspect-video bg-secondary overflow-hidden">
          <img 
            src={item.thumbnail} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
          <div className={`w-12 h-12 ${config.color} rounded-xl opacity-50`} />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Platform badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 ${config.color} rounded-full`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {config.label}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(item)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(item.id)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {/* Notes */}
        {item.notes && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.notes}
          </p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            <Tag className="w-3 h-3 text-muted-foreground" />
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Open link
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </article>
  );
};

export default SavedCard;
