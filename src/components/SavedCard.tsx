import { ExternalLink, MoreVertical, Tag, Star, Clock, Sparkles, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { SavedItem, PlatformType } from "@/types/saved-item";
import { format } from "date-fns";

interface SavedCardProps {
  item: SavedItem;
  onEdit?: (item: SavedItem) => void;
  onDelete?: (id: string) => void;
  onToggleHighlight?: (id: string) => void;
  onSetReminder?: (id: string) => void;
  isAiMatch?: boolean;
}

const platformConfig: Record<PlatformType, { color: string; label: string }> = {
  instagram: { color: "bg-platform-instagram", label: "Instagram" },
  youtube: { color: "bg-platform-youtube", label: "YouTube" },
  twitter: { color: "bg-platform-twitter", label: "Twitter" },
  shopping: { color: "bg-platform-shopping", label: "Shopping" },
  article: { color: "bg-platform-article", label: "Article" },
  other: { color: "bg-platform-other", label: "Other" },
};

const SavedCard = ({
  item,
  onEdit,
  onDelete,
  onToggleHighlight,
  onSetReminder,
  isAiMatch,
}: SavedCardProps) => {
  const config = platformConfig[item.platform];
  const displayImage = item.ogImage || item.thumbnail;
  const allTags = [...item.tags, ...(item.aiTags || [])];
  const uniqueTags = [...new Set(allTags)];

  return (
    <article
      className={`group bg-card rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-300 ${
        isAiMatch
          ? "border-primary/40 ring-2 ring-primary/20 shadow-glow"
          : item.isHighlighted
          ? "border-primary/30 bg-primary/[0.02]"
          : "border-border/50 hover:border-primary/20"
      }`}
    >
      {/* Thumbnail */}
      {displayImage ? (
        <div className="aspect-video bg-secondary overflow-hidden relative">
          <img
            src={displayImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {/* Favicon overlay */}
          {item.favicon && (
            <div className="absolute bottom-2 left-2 w-6 h-6 rounded-md bg-background/90 backdrop-blur-sm p-0.5 shadow-sm">
              <img
                src={item.favicon}
                alt=""
                className="w-full h-full object-contain rounded-sm"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                }}
              />
            </div>
          )}
          {/* Highlight star */}
          {item.isHighlighted && (
            <div className="absolute top-2 right-2">
              <Star className="w-5 h-5 fill-primary text-primary drop-shadow-md" />
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative">
          {item.favicon ? (
            <img
              src={item.favicon}
              alt=""
              className="w-10 h-10 object-contain opacity-60"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const sibling = e.currentTarget.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`w-12 h-12 ${config.color} rounded-xl opacity-50 ${item.favicon ? "hidden" : "flex"} items-center justify-center`}
          >
            <Globe className="w-6 h-6 text-primary-foreground" />
          </div>
          {item.isHighlighted && (
            <div className="absolute top-2 right-2">
              <Star className="w-5 h-5 fill-primary text-primary drop-shadow-md" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Platform badge + actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 ${config.color} rounded-full`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {config.label}
            </span>
            {isAiMatch && (
              <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                AI match
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleHighlight?.(item.id)}>
                <Star className="w-4 h-4 mr-2" />
                {item.isHighlighted ? "Remove highlight" : "Highlight"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSetReminder?.(item.id)}>
                <Clock className="w-4 h-4 mr-2" />
                Set reminder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(item)}>Edit</DropdownMenuItem>
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
        <h3 className="font-display font-semibold text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {/* AI Summary or Description */}
        {(item.summary || item.ogDescription || item.notes) && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {item.summary || item.ogDescription || item.notes}
          </p>
        )}

        {/* Reminder badge */}
        {item.reminderAt && (
          <div className="flex items-center gap-1.5 text-xs text-primary mb-2">
            <Clock className="w-3 h-3" />
            <span>Remind: {format(item.reminderAt, "MMM d, yyyy")}</span>
          </div>
        )}

        {/* Tags (user + AI) */}
        {uniqueTags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            <Tag className="w-3 h-3 text-muted-foreground" />
            {uniqueTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  item.aiTags?.includes(tag)
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {tag}
              </span>
            ))}
            {uniqueTags.length > 4 && (
              <span className="text-xs text-muted-foreground">+{uniqueTags.length - 4}</span>
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
