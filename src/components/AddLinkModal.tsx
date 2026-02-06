import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link as LinkIcon, Tag, FileText, Loader2 } from "lucide-react";
import type { SavedItem, PlatformType } from "@/types/saved-item";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<SavedItem, "id" | "createdAt" | "isHighlighted">) => void;
}

const platformOptions: { value: PlatformType; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter" },
  { value: "shopping", label: "Shopping" },
  { value: "article", label: "Article" },
  { value: "other", label: "Other" },
];

const detectPlatform = (url: string): PlatformType => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("instagram.com")) return "instagram";
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) return "youtube";
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return "twitter";
  if (lowerUrl.includes("amazon.") || lowerUrl.includes("ebay.") || lowerUrl.includes("etsy.")) return "shopping";
  return "article";
};

const AddLinkModal = ({ isOpen, onClose, onSave }: AddLinkModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    platform: "" as PlatformType | "",
    notes: "",
    tags: "",
  });

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      url,
      platform: prev.platform || detectPlatform(url),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    onSave({
      url: formData.url,
      title: formData.title || "Untitled",
      platform: (formData.platform || "other") as PlatformType,
      notes: formData.notes || undefined,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });

    // Reset form
    setFormData({ url: "", title: "", platform: "", notes: "", tags: "" });
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Save a new link</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">Link URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Give it a memorable name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value as PlatformType })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect or select" />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Why are you saving this?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags (optional)
            </Label>
            <Input
              id="tags"
              type="text"
              placeholder="recipes, inspiration, work"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.url}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLinkModal;
