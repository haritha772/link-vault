import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPlatforms: string[];
  onPlatformToggle: (platform: string) => void;
}

const platforms = [
  { id: "instagram", label: "Instagram", color: "bg-platform-instagram" },
  { id: "youtube", label: "YouTube", color: "bg-platform-youtube" },
  { id: "twitter", label: "Twitter", color: "bg-platform-twitter" },
  { id: "shopping", label: "Shopping", color: "bg-platform-shopping" },
  { id: "article", label: "Articles", color: "bg-platform-article" },
  { id: "other", label: "Other", color: "bg-platform-other" },
];

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  selectedPlatforms, 
  onPlatformToggle 
}: SearchBarProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search your saves..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Platform filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
            {selectedPlatforms.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {selectedPlatforms.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Platforms</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {platforms.map((platform) => (
            <DropdownMenuCheckboxItem
              key={platform.id}
              checked={selectedPlatforms.includes(platform.id)}
              onCheckedChange={() => onPlatformToggle(platform.id)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${platform.color} rounded-full`} />
                {platform.label}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SearchBar;
