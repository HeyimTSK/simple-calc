import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome! Let's set up your profile.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      navigate("/app");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-soft">
      <div className="container py-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-smooth">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md animate-scale-in">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-primary items-center justify-center shadow-elegant mb-4">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "signin" ? "Sign in to your financial coach" : "Get personalized financial guidance"}
            </p>
          </div>

          <Card className="p-6 border-border/60 shadow-soft">
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" className="h-11 mt-1.5" />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="h-11 mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} className="h-11 mt-1.5" />
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-primary hover:opacity-90 transition-smooth" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary font-medium hover:underline">
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </Card>

          <p className="text-xs text-center text-muted-foreground mt-6 max-w-sm mx-auto">
            By continuing, you agree this app provides AI-generated guidance, not professional financial advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
