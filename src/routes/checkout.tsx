import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — Ezverse" }],
  }),
  component: Checkout,
});

function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const search: any = Route.useSearch();
  const plan = search.plan || "unknown";
  const amount = search.amount || "0";
  const price = search.price || "0";

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user === null) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { plan, amount, price },
      });

      if (error) {
        if (error.context) {
          const body = await error.context.json();
          throw new Error(body.error || error.message);
        }
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to get checkout URL");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to initiate checkout");
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-24">
        <button
          onClick={() => navigate({ to: "/pricing" })}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pricing
        </button>
        <div className="mt-8 max-w-md mx-auto rounded-2xl border border-border bg-surface-1 p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Order Summary</h1>
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="text-sm font-medium capitalize">
                {plan === "topup" ? "One-time Top-up" : `${plan} Plan`}
              </div>
              <div className="text-sm text-muted-foreground">
                {plan === "topup" ? `${amount} credits` : amount ? `${amount} credits / mo` : ""}
              </div>
            </div>
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{price}</span>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={loading || price === "0"}
            className="mt-8 w-full inline-flex items-center justify-center gap-2 h-11 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Redirecting to Stripe..." : "Pay with Stripe"}
          </button>
        </div>
      </section>
    </SiteLayout>
  );
}
