import { Share2, FolderOpen, Search } from "lucide-react";

const steps = [
  {
    icon: Share2,
    step: "01",
    title: "Share or paste",
    description: "Use the share button on your phone or paste any link directly into Firestore.",
  },
  {
    icon: FolderOpen,
    step: "02",
    title: "Auto-organize",
    description: "We detect the platform and preview the content. Add tags and notes if you want.",
  },
  {
    icon: Search,
    step: "03",
    title: "Find instantly",
    description: "Search by keyword, filter by platform, or browse your tags. Never lose a link again.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple as 1, 2, 3
          </h2>
          <p className="text-muted-foreground text-lg">
            Start saving in seconds. No complex setup required.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}
                
                {/* Step number */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground text-sm font-bold rounded-full flex items-center justify-center">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
