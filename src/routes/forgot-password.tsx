import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — Ezverse" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <SiteLayout>
      <section className="container-page py-20 flex justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8">
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {submitted ? (
            <div className="mt-6 p-4 rounded-md bg-primary/10 text-primary border border-primary/20 text-sm text-center">
              Check your email for a password reset link.
            </div>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                // Need to use the current origin for the redirect
                const redirectTo = `${window.location.origin}/reset-password`;
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo,
                });
                setLoading(false);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                setSubmitted(true);
                toast.success("Password reset email sent");
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
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
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {loading ? "Sending link…" : "Send Reset Link"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
