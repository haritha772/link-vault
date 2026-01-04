import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Plus, LogOut, LayoutGrid, List } from "lucide-react";
import SavedCard, { SavedItem } from "@/components/SavedCard";
import SearchBar from "@/components/SearchBar";
import AddLinkModal from "@/components/AddLinkModal";
import { toast } from "sonner";

// Demo data
const demoItems: SavedItem[] = [
  {
    id: "1",
    title: "Easy 15-Minute Pasta Recipe",
    url: "https://instagram.com/p/example1",
    platform: "instagram",
    thumbnail: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400",
    notes: "Perfect for weeknight dinners",
    tags: ["recipes", "quick meals"],
    createdAt: new Date("2026-01-03"),
  },
  {
    id: "2",
    title: "React Tutorial for Beginners",
    url: "https://youtube.com/watch?v=example2",
    platform: "youtube",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
    notes: "Great explanation of hooks",
    tags: ["learning", "code"],
    createdAt: new Date("2026-01-02"),
  },
  {
    id: "3",
    title: "Nike Air Max 2026 - White/Blue",
    url: "https://amazon.com/dp/example3",
    platform: "shopping",
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    notes: "Size 10, wait for sale",
    tags: ["wishlist", "shoes"],
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "4",
    title: "The Future of AI in 2026",
    url: "https://techcrunch.com/article/example4",
    platform: "article",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400",
    notes: "Interesting predictions about AGI",
    tags: ["tech", "ai"],
    createdAt: new Date("2025-12-30"),
  },
  {
    id: "5",
    title: "Morning Routine Inspiration",
    url: "https://instagram.com/p/example5",
    platform: "instagram",
    notes: "5am club content",
    tags: ["productivity", "wellness"],
    createdAt: new Date("2025-12-28"),
  },
  {
    id: "6",
    title: "How to Style a Small Living Room",
    url: "https://youtube.com/watch?v=example6",
    platform: "youtube",
    thumbnail: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    tags: ["home", "design"],
    createdAt: new Date("2025-12-25"),
  },
];

const Dashboard = () => {
  const [items, setItems] = useState<SavedItem[]>(demoItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Platform filter
      const matchesPlatform =
        selectedPlatforms.length === 0 || selectedPlatforms.includes(item.platform);

      return matchesSearch && matchesPlatform;
    });
  }, [items, searchQuery, selectedPlatforms]);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleAddItem = (newItem: Omit<SavedItem, "id" | "createdAt">) => {
    const item: SavedItem = {
      ...newItem,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setItems((prev) => [item, ...prev]);
    toast.success("Link saved!", {
      description: "Your link has been added to your collection.",
    });
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Link deleted");
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Firestore</title>
        <meta name="description" content="View and manage your saved links and content." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <Flame className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-semibold text-foreground">
                  Firestore
                </span>
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add link</span>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/">
                    <LogOut className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Your saves
            </h1>
            <p className="text-muted-foreground">
              {items.length} items saved • {filteredItems.length} showing
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={handlePlatformToggle}
            />

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Items grid/list */}
          {filteredItems.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {filteredItems.map((item) => (
                <SavedCard
                  key={item.id}
                  item={item}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                {searchQuery || selectedPlatforms.length > 0
                  ? "No results found"
                  : "No saves yet"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {searchQuery || selectedPlatforms.length > 0
                  ? "Try adjusting your search or filters"
                  : "Start by saving your first link"}
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first link
              </Button>
            </div>
          )}
        </main>

        {/* Add modal */}
        <AddLinkModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddItem}
        />
      </div>
    </>
  );
};

export default Dashboard;
