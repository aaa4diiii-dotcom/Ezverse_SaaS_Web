import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Ezverse" },
      { name: "description", content: "Simple credit-based pricing. One plan. Top up when you need more." },
    ],
  }),
  component: Pricing,
});

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    credits: "50 credits",
    desc: "Try every tool. No card required.",
    features: ["50 one-time credits", "Access all tools", "Community support"],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹49",
    suffix: " one-time",
    credits: "2,000 credits",
    desc: "For active creators and developers.",
    features: ["2,000 one-time credits", "Access all tools", "API access", "Priority support", "Credits never expire"],
    cta: "Start Pro",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Team",
    price: "₹50",
    suffix: " one-time",
    credits: "10,000 credits",
    desc: "Shared credits across your team.",
    features: ["10,000 one-time credits", "Up to 10 seats", "Usage analytics", "SSO + audit logs", "Dedicated support"],
    cta: "Start Team",
    href: "/signup",
    highlight: false,
  },
];

function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTopUp = (price: string, credits: string) => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    navigate({ to: "/checkout", search: { plan: "topup", amount: credits, price: price.replace("₹", "") } });
  };

  return (
    <SiteLayout>
      <section className="container-page pt-20 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Simple, credit-based pricing</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          One plan, every tool. Credits never expire on paid plans. Top up anytime.
        </p>
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border p-7 flex flex-col ${
                t.highlight
                  ? "border-primary bg-gradient-to-b from-primary/5 to-surface-1 glow-accent"
                  : "border-border bg-surface-1"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{t.name}</h3>
                {t.highlight && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{t.price}</span>
                {t.suffix && <span className="text-sm text-muted-foreground">{t.suffix}</span>}
              </div>
              <div className="mt-1 text-sm text-primary font-medium">{t.credits}</div>
              <p className="mt-3 text-sm text-muted-foreground">{t.desc}</p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={user ? "/checkout" : "/signup"}
                search={user ? { 
                  plan: t.name.toLowerCase(), 
                  price: t.price.replace("₹", ""),
                  amount: t.credits.split(" ")[0].replace(/,/g, "")
                } : undefined}
                className={`mt-7 inline-flex items-center justify-center h-10 px-5 text-sm font-semibold rounded-md transition-opacity ${
                  t.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border hover:border-primary hover:text-primary"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="rounded-2xl border border-border bg-surface-1 p-8">
          <h2 className="text-xl font-bold">Need more credits?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Top up at any time. Top-up credits never expire.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { credits: "500", price: "₹49" },
              { credits: "2,500", price: "₹99" },
              { credits: "10,000", price: "₹249" },
            ].map((p) => (
              <div key={p.credits} className="rounded-lg border border-border p-4 flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">{p.credits} credits</div>
                  <div className="text-xs text-muted-foreground">One-time top-up</div>
                </div>
                <button 
                  onClick={() => handleTopUp(p.price, p.credits)}
                  className="text-lg font-bold text-primary hover:underline"
                >
                  {p.price}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
