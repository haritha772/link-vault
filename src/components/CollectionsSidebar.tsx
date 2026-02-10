import { useState } from "react";
import { Folder, Plus, Star, Inbox, Trash2, Share2, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { Collection } from "@/types/saved-item";

interface CollectionsSidebarProps {
  collections: Collection[];
  selectedCollection: string | null;
  showHighlightsOnly: boolean;
  onSelectCollection: (id: string | null) => void;
  onToggleHighlights: (show: boolean) => void;
  onCreateCollection: (name: string, color: string) => void;
  onDeleteCollection: (id: string) => void;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
  totalItems: number;
  highlightedCount: number;
}

const COLORS = [
  "#FF6B35", "#E91E63", "#9C27B0", "#3F51B5",
  "#00BCD4", "#4CAF50", "#FF9800", "#795548",
];

const CollectionsSidebar = ({
  collections,
  selectedCollection,
  showHighlightsOnly,
  onSelectCollection,
  onToggleHighlights,
  onCreateCollection,
  onDeleteCollection,
  onTogglePublic,
  totalItems,
  highlightedCount,
}: CollectionsSidebarProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateCollection(newName.trim(), newColor);
    setNewName("");
    setNewColor(COLORS[0]);
    setShowCreateModal(false);
  };

  return (
    <>
      <aside className="w-full lg:w-56 shrink-0">
        <nav className="space-y-1">
          {/* All items */}
          <button
            onClick={() => {
              onSelectCollection(null);
              onToggleHighlights(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              !selectedCollection && !showHighlightsOnly
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span className="flex-1 text-left">All saves</span>
            <span className="text-xs opacity-60">{totalItems}</span>
          </button>

          {/* Highlights */}
          <button
            onClick={() => {
              onSelectCollection(null);
              onToggleHighlights(!showHighlightsOnly);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              showHighlightsOnly
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="flex-1 text-left">Highlights</span>
            <span className="text-xs opacity-60">{highlightedCount}</span>
          </button>

          {/* Divider */}
          <div className="pt-3 pb-1 px-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Collections
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Collections list */}
          {collections.map((collection) => (
            <div key={collection.id} className="group">
              <button
                onClick={() => {
                  onSelectCollection(collection.id);
                  onToggleHighlights(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  selectedCollection === collection.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: collection.color }}
                />
                <span className="flex-1 text-left truncate">{collection.name}</span>
                {collection.isPublic && (
                  <Globe className="w-3 h-3 text-primary shrink-0" />
                )}
              </button>
              <div className="flex items-center gap-0.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 mb-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title={collection.isPublic ? "Copy share link" : "Make public to share"}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (collection.isPublic && collection.shareSlug) {
                      navigator.clipboard.writeText(`${window.location.origin}/shared/${collection.shareSlug}`);
                      toast.success("Share link copied!");
                    } else {
                      onTogglePublic?.(collection.id, true);
                    }
                  }}
                >
                  <Share2 className="w-3 h-3" />
                </Button>
                {collection.isPublic && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="Make private"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePublic?.(collection.id, false);
                    }}
                  >
                    <Lock className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCollection(collection.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          {collections.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No collections yet
            </p>
          )}
        </nav>
      </aside>

      {/* Create collection modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">New collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              placeholder="Collection name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    newColor === c ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Button onClick={handleCreate} disabled={!newName.trim()} className="w-full">
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CollectionsSidebar;
