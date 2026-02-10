import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { Flame, ExternalLink, Loader2, Eye, Clock, Copy, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import PlatformIcon from "@/components/PlatformIcon";
import type { SavedItem, PlatformType } from "@/types/saved-item";
import { mapSavedLink } from "@/types/saved-item";
import { format } from "date-fns";
import { toast } from "sonner";

const SharedCollection = () => {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedCollection = async () => {
      if (!slug) return;
      try {
        // Fetch the public collection by slug
        const { data: colData, error: colError } = await supabase
          .from("collections")
          .select("*")
          .eq("share_slug", slug)
          .eq("is_public", true)
          .single();

        if (colError || !colData) {
          setError("Collection not found or is private.");
          setIsLoading(false);
          return;
        }

        setCollection(colData);

        // Fetch links in this collection
        const { data: linksData, error: linksError } = await supabase
          .from("saved_links")
          .select("*")
          .eq("collection_id", colData.id)
          .order("created_at", { ascending: false });

        if (linksError) throw linksError;
        setItems((linksData || []).map(mapSavedLink));
      } catch (err) {
        console.error("Error fetching shared collection:", err);
        setError("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedCollection();
  }, [slug]);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLinkClick = async (id: string) => {
    // Increment view count via direct update
    try {
      await supabase
        .from("saved_links")
        .update({ view_count: 1 } as any)
        .eq("id", id);
    } catch {
      // silently fail
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center">
          <Flame className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">{error || "Not found"}</h1>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Firestore
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{collection.name} - Shared Collection | Firestore</title>
        <meta name="description" content={collection.description || `A curated collection of ${items.length} links shared via Firestore.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <Flame className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display text-xl font-semibold text-foreground">Firestore</span>
              </Link>
              <Link to="/auth">
                <Button size="sm">Sign up free</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Collection header */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md"
              style={{ backgroundColor: collection.color }}
            >
              <span className="text-2xl">📂</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-3">{collection.name}</h1>
            {collection.description && (
              <p className="text-lg text-muted-foreground mb-4">{collection.description}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {items.length} links
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated {format(new Date(collection.updated_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          {/* Links grid */}
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {items.map((item) => {
                const displayImage = item.ogImage || item.thumbnail;
                const allTags = [...new Set([...item.tags, ...(item.aiTags || [])])];
                return (
                  <article
                    key={item.id}
                    className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-300"
                  >
                    {displayImage ? (
                      <div className="aspect-video bg-secondary overflow-hidden relative">
                        <img
                          src={displayImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        {item.favicon && (
                          <div className="absolute bottom-2 left-2 w-6 h-6 rounded-md bg-background/90 backdrop-blur-sm p-0.5 shadow-sm">
                            <img src={item.favicon} alt="" className="w-full h-full object-contain rounded-sm" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                        <PlatformIcon platform={item.platform} size={32} className="text-muted-foreground opacity-50" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformIcon platform={item.platform} size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {item.platform}
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-foreground mb-1.5 line-clamp-2">{item.title}</h3>
                      {(item.summary || item.ogDescription) && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.summary || item.ogDescription}</p>
                      )}
                      {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {allTags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleLinkClick(item.id)}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline flex-1"
                        >
                          Open link
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopyUrl(item.url, item.id)}
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">This collection is empty.</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-lg mx-auto">
            <Flame className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Create your own collection</h2>
            <p className="text-muted-foreground mb-6">Save, organize, and share links from anywhere on the web.</p>
            <Link to="/auth">
              <Button size="lg">Get started free</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SharedCollection;
