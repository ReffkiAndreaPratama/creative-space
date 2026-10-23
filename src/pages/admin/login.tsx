import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AdminLoginPage() {
  const { isAuthenticated, loading, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (error) {
      toast({ type: "error", title: "Login failed", message: error });
    } else {
      toast({ type: "success", title: "Welcome back" });
      navigate("/admin");
    }
  };

  return (
    <>
      <SEO title="Admin Login" description="Sign in to the Nexreff Creative Space admin dashboard." />

      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-foreground">Nexreff</h1>
            <p className="mt-2 text-sm text-muted">Admin Dashboard</p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-muted">
                Supabase is not configured. Add <code className="text-accent">VITE_SUPABASE_URL</code> and
                <code className="text-accent"> VITE_SUPABASE_PUBLISHABLE_KEY</code> to your
                <code className="text-accent"> .env</code> file to enable login.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="pl-9"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting || !isSupabaseConfigured}
              className="w-full"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            Admin access only. Create your admin account in the Supabase Dashboard under Authentication.
          </p>
        </div>
      </div>
    </>
  );
}
