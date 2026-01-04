import { Bookmark, Search, Tag, Smartphone, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Bookmark,
    title: "Save from anywhere",
    description: "Capture links from Instagram, YouTube, TikTok, Amazon, and any website with one click.",
  },
  {
    icon: Search,
    title: "Instant search",
    description: "Find any saved item in seconds with powerful search across titles, notes, and tags.",
  },
  {
    icon: Tag,
    title: "Smart tagging",
    description: "Organize your saves with custom tags and let AI auto-categorize your content.",
  },
  {
    icon: Smartphone,
    title: "Works everywhere",
    description: "Access your collection on any device. Share from your phone, browse on desktop.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Optimized for speed. Your content loads instantly, even with thousands of saves.",
  },
  {
    icon: Shield,
    title: "Private & secure",
    description: "Your data is encrypted and never shared. You own your content, always.",
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
