import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/payment-success")({
  head: () => ({
    meta: [{ title: "Payment Successful — Ezverse" }],
  }),
  component: PaymentSuccess,
});

function PaymentSuccess() {
  return (
    <SiteLayout>
      <section className="container-page pt-24 pb-32 flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Payment Successful!</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          Thank you for your purchase. Your account has been credited and you are ready to continue using all of our premium tools.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center h-12 px-8 text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center h-12 px-8 text-sm font-semibold rounded-md border border-border hover:border-primary hover:text-primary transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
