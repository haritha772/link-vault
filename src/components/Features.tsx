import { Bookmark, Search, Tag, Smartphone, Zap, Share2, Sparkles, Globe } from "lucide-react";

const features = [
  {
    icon: Bookmark,
    title: "Save from anywhere",
    description: "Capture links from Instagram, YouTube, TikTok, Amazon, and any website with one click.",
  },
  {
    icon: Sparkles,
    title: "AI auto-tagging",
    description: "AI automatically summarizes, tags, and enriches every link you save. No manual work needed.",
  },
  {
    icon: Search,
    title: "AI-powered search",
    description: "Ask questions in natural language. Find 'that recipe video from last week' instantly.",
  },
  {
    icon: Share2,
    title: "Share collections",
    description: "Make any collection public with a single click. Share curated link lists with anyone.",
  },
  {
    icon: Globe,
    title: "Works everywhere",
    description: "Access your collection on any device. Open saved links anytime, anywhere.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Optimized for speed. Rich previews, instant search, and smart organization.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to save smarter
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features designed to make saving and finding your content effortless.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
