import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-8 shadow-lg shadow-primary/25">
            <Flame className="w-8 h-8 text-primary-foreground" />
          </div>

          {/* Headline */}
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to organize your digital life?
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of people who never lose a link again. 
            Start for free, no credit card required.
          </p>

          {/* CTA Button */}
          <Button variant="hero" size="xl" asChild>
            <Link to="/auth?mode=signup">
              Get started for free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          {/* Social proof */}
          <p className="mt-8 text-sm text-muted-foreground">
            ★★★★★ Loved by 10,000+ users
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
