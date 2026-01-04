import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-platform-instagram/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-platform-youtube/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-secondary-foreground">
              Save everything. Find anything.
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Your digital life,{" "}
            <span className="text-primary">beautifully organized</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Save links from Instagram, YouTube, articles, and shopping sites. 
            Add notes, tag, and search—all in one beautiful place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth?mode=signup">
                Start saving free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/dashboard">
                <Bookmark className="w-5 h-5" />
                View demo
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 mt-12 text-muted-foreground animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-platform-shopping rounded-full" />
              <span className="text-sm">Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-platform-instagram rounded-full" />
              <span className="text-sm">No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-platform-youtube rounded-full" />
              <span className="text-sm">Sync everywhere</span>
            </div>
          </div>
        </div>

        {/* Preview mockup */}
        <div className="mt-16 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Sample cards */}
              {[
                { platform: "instagram", color: "bg-platform-instagram", title: "Recipe inspo" },
                { platform: "youtube", color: "bg-platform-youtube", title: "Learn React" },
                { platform: "shopping", color: "bg-platform-shopping", title: "New sneakers" },
                { platform: "article", color: "bg-platform-article", title: "Tech news" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-secondary/50 rounded-xl p-4 hover:bg-secondary transition-colors cursor-pointer group"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className={`w-8 h-8 ${item.color} rounded-lg mb-3 flex items-center justify-center`}>
                    <Bookmark className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{item.platform}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
