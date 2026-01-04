import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Flame className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground">
              Firestore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isHomePage && (
              <>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  Features
                </a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                  How it works
                </a>
              </>
            )}
            <div className="flex items-center gap-3 ml-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth?mode=signup">Get started</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-3">
              {isHomePage && (
                <>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-muted-foreground hover:text-foreground transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    How it works
                  </a>
                </>
              )}
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?mode=signup" onClick={() => setIsOpen(false)}>Get started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
