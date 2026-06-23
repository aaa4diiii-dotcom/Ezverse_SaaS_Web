import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — Ezverse" }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  return (
    <SiteLayout>
      <section className="container-page py-20 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start with <span className="text-primary">50 free credits</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-md">
            No card required. Try every tool. Upgrade when you're ready.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              "Access to all 50+ AI tools",
              "Latest models — GPT-5, Claude 4, Gemini 3",
              "Credits never expire on paid plans",
              "Cancel anytime",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface-1 p-8">
          <h2 className="text-xl font-bold">Create your account</h2>
          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const redirectUrl = `${window.location.origin}/dashboard`;
              const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  emailRedirectTo: redirectUrl,
                  data: { name },
                },
              });
              setLoading(false);
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success("Account created — check your email to confirm.");
              navigate({ to: "/dashboard" });
            }}
          >
            <div>
              <label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full h-10 px-3 rounded-md bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full h-10 px-3 rounded-md bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full h-10 px-3 rounded-md bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">At least 8 characters.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity glow-accent disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
