import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, ArrowLeft, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const authSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signUp, signIn } = useAuth();
  
  const [isSignup, setIsSignup] = useState(searchParams.get("mode") === "signup");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    try {
      if (isSignup) {
        authSchema.parse(formData);
      } else {
        authSchema.omit({ name: true }).parse(formData);
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isSignup) {
        const { error } = await signUp(formData.email, formData.password, formData.name);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Account exists", {
              description: "This email is already registered. Try signing in instead.",
            });
          } else {
            toast.error("Signup failed", {
              description: error.message,
            });
          }
        } else {
          toast.success("Account created!", {
            description: "You're now signed in.",
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid credentials", {
              description: "Please check your email and password.",
            });
          } else {
            toast.error("Sign in failed", {
              description: error.message,
            });
          }
        } else {
          toast.success("Welcome back!", {
            description: "You're now signed in.",
          });
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isSignup ? "Sign up" : "Sign in"} - Firestore</title>
        <meta 
          name="description" 
          content={isSignup 
            ? "Create your Firestore account and start saving links from anywhere." 
            : "Sign in to your Firestore account to access your saved links."
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-background flex">
        {/* Left panel - Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            {/* Back link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-semibold text-foreground">
                Firestore
              </span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                {isSignup ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground">
                {isSignup 
                  ? "Start organizing your digital life today." 
                  : "Sign in to access your saved content."
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading 
                  ? "Loading..." 
                  : isSignup ? "Create account" : "Sign in"
                }
              </Button>
            </form>

            {/* Toggle */}
            <p className="mt-6 text-center text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary hover:underline font-medium"
              >
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>

        {/* Right panel - Decorative */}
        <div className="hidden lg:flex flex-1 bg-secondary/50 items-center justify-center p-12">
          <div className="max-w-md text-center">
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { color: "bg-platform-instagram", label: "Instagram" },
                { color: "bg-platform-youtube", label: "YouTube" },
                { color: "bg-platform-shopping", label: "Shopping" },
                { color: "bg-platform-article", label: "Articles" },
              ].map((platform, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-xl p-4 shadow-sm border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-8 h-8 ${platform.color} rounded-lg mb-2`} />
                  <p className="text-sm text-muted-foreground">{platform.label}</p>
                </div>
              ))}
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              All your saves in one place
            </h2>
            <p className="text-muted-foreground">
              Connect your favorite platforms and never lose a link again.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
