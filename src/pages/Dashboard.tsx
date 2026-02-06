import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Plus, LogOut, LayoutGrid, List, Loader2 } from "lucide-react";
import SavedCard from "@/components/SavedCard";
import SearchBar from "@/components/SearchBar";
import AiSearchBar from "@/components/AiSearchBar";
import AddLinkModal from "@/components/AddLinkModal";
import CollectionsSidebar from "@/components/CollectionsSidebar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedLinks } from "@/hooks/useSavedLinks";
import { useCollections } from "@/hooks/useCollections";
import { useAiSearch } from "@/hooks/useAiSearch";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut } = useAuth();

  const {
    items,
    filteredItems,
    isLoading: isLoadingItems,
    searchQuery,
    setSearchQuery,
    selectedPlatforms,
    handlePlatformToggle,
    selectedCollection,
    setSelectedCollection,
    showHighlightsOnly,
    setShowHighlightsOnly,
    addItem,
    deleteItem,
    toggleHighlight,
    setReminder,
  } = useSavedLinks(user?.id);

  const { collections, createCollection, deleteCollection } = useCollections(user?.id);
  const { isSearching, result: aiResult, search: aiSearch, clearResult: clearAiResult } = useAiSearch();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const highlightedCount = items.filter((i) => i.isHighlighted).length;

  // Determine which items to show
  const displayItems = aiResult?.matchedIds.length
    ? filteredItems
    : filteredItems;

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
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <Flame className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-semibold text-foreground">
                  Firestore
                </span>
              </Link>

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
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Your saves
            </h1>
            <p className="text-muted-foreground">
              {items.length} items saved • {filteredItems.length} showing
            </p>
          </div>

          {/* AI Search */}
          <div className="mb-6">
            <AiSearchBar
              isSearching={isSearching}
              result={aiResult}
              onSearch={aiSearch}
              onClear={clearAiResult}
            />
          </div>

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={handlePlatformToggle}
            />
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

          {/* Layout with sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Collections sidebar */}
            <CollectionsSidebar
              collections={collections}
              selectedCollection={selectedCollection}
              showHighlightsOnly={showHighlightsOnly}
              onSelectCollection={setSelectedCollection}
              onToggleHighlights={setShowHighlightsOnly}
              onCreateCollection={createCollection}
              onDeleteCollection={deleteCollection}
              totalItems={items.length}
              highlightedCount={highlightedCount}
            />

            {/* Content area */}
            <div className="flex-1 min-w-0">
              {isLoadingItems ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : displayItems.length > 0 ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "flex flex-col gap-4"
                  }
                >
                  {displayItems.map((item) => (
                    <SavedCard
                      key={item.id}
                      item={item}
                      onDelete={deleteItem}
                      onToggleHighlight={toggleHighlight}
                      isAiMatch={aiResult?.matchedIds.includes(item.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Flame className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">
                    {searchQuery || selectedPlatforms.length > 0 || selectedCollection || showHighlightsOnly
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
            </div>
          </div>
        </main>

        <AddLinkModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={addItem}
        />
      </div>
    </>
  );
};

export default Dashboard;
