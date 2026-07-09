import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set New Password — Ezverse" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Check if we have recovery tokens in the URL (hash or query)
    const hasRecoveryToken = 
      window.location.hash.includes("access_token") || 
      window.location.search.includes("code") ||
      window.location.hash.includes("type=recovery");

    const checkSession = async () => {
      // If we have a token, wait a brief moment for Supabase to process it
      if (hasRecoveryToken) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;

      if (!session && !hasRecoveryToken) {
        toast.error("You must follow the reset link from your email to view this page.");
        navigate({ to: "/login" });
      } else {
        setVerifying(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setVerifying(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <SiteLayout>
      <section className="container-page py-20 flex justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface-1 p-8">
          <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
          
          {verifying ? (
            <div className="mt-8 flex flex-col items-center justify-center space-y-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verifying recovery link...</p>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                Please enter your new password below.
              </p>

              <form
                className="mt-6 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (password !== confirmPassword) {
                    toast.error("Passwords do not match");
                    return;
                  }
                  if (password.length < 6) {
                    toast.error("Password must be at least 6 characters");
                    return;
                  }

                  setLoading(true);
                  const { error } = await supabase.auth.updateUser({ password });
                  setLoading(false);
                  
                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                  
                  toast.success("Password updated successfully");
                  navigate({ to: "/dashboard" });
                }}
              >
                <div>
                  <label
                    htmlFor="password"
                    className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 w-full h-10 px-3 rounded-md bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1.5 w-full h-10 px-3 rounded-md bg-background border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

