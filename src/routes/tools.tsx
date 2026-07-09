import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useTools, CATEGORIES, type ToolCategory } from "@/lib/tools-data";
import { useEffect, useMemo, useState } from "react";
import { Search, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Tools — Ezverse" },
      { name: "description", content: "Browse the full catalogue of AI tools on Ezverse." },
    ],
  }),
  component: ToolsLayout,
});

function ToolsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // If on a child route (e.g. /tools/blog-post-writer), render outlet only
  if (pathname !== "/tools" && pathname !== "/tools/") {
    return <Outlet />;
  }
  return <ToolsIndex />;
}

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function ToolsIndex() {
  const { data: tools } = useTools();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<ToolCategory | "All">("All");
  const debounced = useDebounced(query, 300);

  const filtered = useMemo(() => {
    if (!tools) return [];
    const q = debounced.trim().toLowerCase();
    return tools.filter((t) => {
      if (activeCat !== "All" && t.category !== activeCat) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [debounced, activeCat]);

  return (
    <SiteLayout>
      <section className="container-page pt-16 pb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">AI Tools</h1>
        <p className="mt-3 text-muted-foreground max-w-xl">
          {tools?.length || 0} tools and counting. Search by name, filter by category.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              aria-label="Search tools"
              className="w-full h-11 pl-10 pr-4 rounded-md bg-surface-1 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["All", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${activeCat === cat
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-border-hover hover:text-foreground"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-24">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface-1 p-12 text-center">
            <p className="text-sm text-muted-foreground">No tools match your search.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => {
              const cardContent = (
                <>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-primary">{t.category}</span>
                    {t.popular && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-semibold group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground flex-1">{t.tagline}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t.credits} credits / run</span>
                    <span className="text-primary inline-flex items-center gap-1">
                      Try <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </>
              );

              const className = "group rounded-xl border border-border bg-surface-1 p-5 hover:border-primary transition-colors flex flex-col";

              if (t.slug === "pdf-extractor") {
                return (
                  <Link key={t.slug} to="/tools/pdf-extractor" className={className}>
                    {cardContent}
                  </Link>
                );
              }
              if (t.slug === "sales-lead-qualifier") {
                return (
                  <Link key={t.slug} to="/tools/sales-lead-qualifier" className={className}>
                    {cardContent}
                  </Link>
                );
              }

              return (
                <Link
                  key={t.slug}
                  to="/tools/$slug"
                  params={{ slug: t.slug }}
                  className={className}
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
