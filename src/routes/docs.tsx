import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BookOpen, Code2, Key, Zap } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Ezverse" },
      { name: "description", content: "Get started with Ezverse. Quickstart, API reference, and guides." },
    ],
  }),
  component: Docs,
});

const SECTIONS = [
  { icon: Zap, title: "Quickstart", body: "Sign up, grab 50 free credits, and run your first tool in under 2 minutes." },
  { icon: Key, title: "Authentication", body: "Get an API key from your dashboard and pass it as a Bearer token." },
  { icon: Code2, title: "API Reference", body: "Every tool exposes POST /v1/tools/{slug} with a JSON body and JSON response." },
  { icon: BookOpen, title: "Guides", body: "Recipes for chaining tools, batching, webhooks, and rate limiting." },
];

function Docs() {
  return (
    <SiteLayout>
      <section className="container-page pt-20 pb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Documentation</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          Everything you need to build with Ezverse.
        </p>
      </section>

      <section className="container-page pb-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-surface-1 p-6">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/30 text-primary">
                <s.icon className="h-4 w-4" />
              </span>
              <h2 className="mt-4 text-base font-semibold">{s.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-24">
        <h2 className="text-2xl font-bold tracking-tight">Quickstart</h2>
        <div className="mt-4 rounded-xl border border-border bg-surface-1 p-6">
          <pre className="text-sm font-mono overflow-x-auto leading-relaxed">
{`# 1. Get your API key from /dashboard/keys

# 2. Call any tool
curl https://api.ezverse.dev/v1/tools/blog-post-writer \\
  -H "Authorization: Bearer $NF_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "The rise of edge AI in 2026"}'

# 3. Get JSON back
{
  "output": "# The Rise of Edge AI in 2026...",
  "credits_used": 5,
  "credits_remaining": 1995
}`}
          </pre>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Ready to build?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Create a free account →
          </Link>
        </p>
      </section>
    </SiteLayout>
  );
}
