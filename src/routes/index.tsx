import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useTools } from "@/lib/tools-data";
import { ArrowUpRight, Zap, Sparkles, Shield, Coins, Code2, Image as ImageIcon, FileText, Mic, Video, Database, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ezverse — Every AI Tool You Need. One Platform." },
      { name: "description", content: "Access 50+ AI tools powered by credits. No subscriptions per tool — just one flat plan." },
      { property: "og:title", content: "Ezverse — AI Tools Marketplace" },
      { property: "og:description", content: "50+ AI tools. Pay as you go with credits. One flat plan." },
    ],
  }),
  component: Home,
});

const CATEGORY_ICONS = {
  Writing: FileText,
  Image: ImageIcon,
  Code: Code2,
  Audio: Mic,
  Video: Video,
  Data: Database,
} as const;

function Home() {
  const { data: tools } = useTools();
  const featured = (tools || []).filter((t) => t.popular).slice(0, 6);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-32 mx-auto h-72 w-[36rem] max-w-full rounded-full bg-primary/20 blur-[120px] opacity-60 pointer-events-none" />
        <div className="container-page relative pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs text-muted-foreground">
            <span className="text-primary">✦</span> AI-Powered Tools Marketplace
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
            Every AI Tool You Need.<br />
            One Platform.<br />
            <span className="text-primary">Pay as You Go.</span>
          </h1>
          <p className="mt-6 mx-auto max-w-xl text-sm sm:text-base text-muted-foreground">
            Access 50+ AI tools powered by credits. No subscriptions per tool — just one flat plan.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center h-11 px-6 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity glow-accent"
            >
              Get Started Free
            </Link>
            <Link
              to="/tools"
              className="inline-flex items-center justify-center gap-1 h-11 px-6 text-sm font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
            >
              Browse Tools <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> 50 free credits</span>
            <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No card required</span>
            <span className="hidden sm:flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-20 border-t border-border">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Why Ezverse</h2>
          <p className="mt-3 text-muted-foreground">One platform replaces a dozen subscriptions.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "50+ AI tools", body: "Writing, image, code, audio, video, data — all in one place." },
            { icon: Coins, title: "Credit-based pricing", body: "Pay only for what you use. Credits never expire." },
            { icon: Shield, title: "Private by default", body: "Your inputs are never used to train models. Encrypted in transit." },
            { icon: Sparkles, title: "Latest models", body: "GPT-5, Claude 4, Gemini 3, and open-source — automatically routed." },
            { icon: Code2, title: "Developer API", body: "Every tool exposes a clean REST endpoint with one auth key." },
            { icon: ArrowUpRight, title: "Ships every week", body: "New tools added weekly based on what users vote for." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-surface-1 p-6 hover:border-border-hover transition-colors">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/30 text-primary">
                <f.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-20 border-t border-border">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Browse by category</h2>
            <p className="mt-2 text-muted-foreground text-sm">Pick a workflow, jump to the tool.</p>
          </div>
          <Link to="/tools" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            All tools <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-8 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          {(Object.keys(CATEGORY_ICONS) as Array<keyof typeof CATEGORY_ICONS>).map((cat) => {
            const Icon = CATEGORY_ICONS[cat];
            const count = (tools || []).filter((t) => t.category === cat).length;
            return (
              <Link
                key={cat}
                to="/tools"
                className="rounded-xl border border-border bg-surface-1 p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-surface-2 transition-colors"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{cat}</span>
                <span className="text-[11px] text-muted-foreground">{count} tools</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured tools */}
      <section className="container-page py-20 border-t border-border">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Popular this week</h2>
            <p className="mt-2 text-muted-foreground text-sm">The tools users open most often.</p>
          </div>
          <Link to="/tools" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
            See all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => {
            const Icon = CATEGORY_ICONS[t.category];
            return (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="group rounded-xl border border-border bg-surface-1 p-5 hover:border-primary transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/30 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.category}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold group-hover:text-primary transition-colors">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground flex-1">{t.tagline}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.credits} credits / run</span>
                  <span className="text-primary inline-flex items-center gap-1">Try <ArrowUpRight className="h-3 w-3" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="container-page py-20 border-t border-border">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-surface-1 to-background p-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, credit-based pricing</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            One plan. Top up credits when you need them. No per-tool subscriptions, no hidden fees.
          </p>
          <div className="mt-8">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center h-11 px-6 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity glow-accent"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 border-t border-border text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to forge?</h2>
        <p className="mt-3 text-muted-foreground">Start with 50 free credits. No card required.</p>
        <div className="mt-6">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center h-11 px-6 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity glow-accent"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
