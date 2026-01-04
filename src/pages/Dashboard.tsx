import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Plus, LogOut, LayoutGrid, List, Loader2 } from "lucide-react";
import SavedCard from "@/components/SavedCard";
import SearchBar from "@/components/SearchBar";
import AddLinkModal from "@/components/AddLinkModal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SavedLink = Database["public"]["Tables"]["saved_links"]["Row"];
type PlatformType = Database["public"]["Enums"]["platform_type"];

interface SavedItem {
  id: string;
  title: string;
  url: string;
  platform: PlatformType;
  thumbnail?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();
  
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch saved links
  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("saved_links")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        const mappedItems: SavedItem[] = (data || []).map((link: SavedLink) => ({
          id: link.id,
          title: link.title,
          url: link.url,
          platform: link.platform,
          thumbnail: link.thumbnail || undefined,
          notes: link.notes || undefined,
          tags: link.tags || [],
          createdAt: new Date(link.created_at),
        }));
        
        setItems(mappedItems);
      } catch (error) {
        console.error("Error fetching links:", error);
        toast.error("Failed to load your saved links");
      } finally {
        setIsLoadingItems(false);
      }
    };
    
    if (user) {
      fetchLinks();
    }
  }, [user]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const handleAddItem = async (newItem: Omit<SavedItem, "id" | "createdAt">) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("saved_links")
        .insert({
          user_id: user.id,
          title: newItem.title,
          url: newItem.url,
          platform: newItem.platform,
          thumbnail: newItem.thumbnail || null,
          notes: newItem.notes || null,
          tags: newItem.tags,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const item: SavedItem = {
        id: data.id,
        title: data.title,
        url: data.url,
        platform: data.platform,
        thumbnail: data.thumbnail || undefined,
        notes: data.notes || undefined,
        tags: data.tags || [],
        createdAt: new Date(data.created_at),
      };
      
      setItems((prev) => [item, ...prev]);
      toast.success("Link saved!", {
        description: "Your link has been added to your collection.",
      });
    } catch (error) {
      console.error("Error saving link:", error);
      toast.error("Failed to save link", {
        description: "Please try again.",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_links")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Link deleted");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
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

          {/* Loading state */}
          {isLoadingItems ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length > 0 ? (
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
