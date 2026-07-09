import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useTools } from "@/lib/tools-data";
import { Coins, TrendingUp, Zap, ArrowUpRight, History as HistoryIcon, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { fetchToolRuns, type ToolRun } from "@/lib/tool-history";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Ezverse" }] }),
  component: Dashboard,
});

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

function Dashboard() {
  const { data: tools } = useTools();
  const favs = (tools || []).slice(0, 4);
  const { displayName, user } = useAuth();
  const navigate = useNavigate();
  const [recent, setRecent] = useState<ToolRun[]>([]);
  const [profile, setProfile] = useState<{ credits: number | null; name: string | null }>({ credits: null, name: null });
  const [runCount, setRunCount] = useState<number>(0);
  const [mostUsed, setMostUsed] = useState<string>("—");

  useEffect(() => {
    if (!user) {
      setRecent([]);
      setProfile({ credits: null, name: null });
      setRunCount(0);
      setMostUsed("—");
      return;
    }
    fetchToolRuns(50).then((rows) => {
      setRecent(rows.slice(0, 5));
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const thisMonth = rows.filter((r) => new Date(r.created_at) >= monthStart);
      setRunCount(thisMonth.length);
      const counts = new Map<string, number>();
      for (const r of rows) counts.set(r.tool_name, (counts.get(r.tool_name) ?? 0) + 1);
      let top = "—", best = 0;
      for (const [k, v] of counts) if (v > best) { top = k; best = v; }
      setMostUsed(top);
    }).catch(() => undefined);
    supabase
      .from("profiles")
      .select("credits, name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({ credits: (data as { credits: number | null }).credits ?? 0, name: data.name ?? null });
      });
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome back{profile.name || displayName ? `, ${profile.name || displayName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Here's a snapshot of your activity.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              <Coins className="h-4 w-4 mr-2" />
              Top up credits
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold border border-border rounded-md hover:bg-surface-1 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Coins, label: "Credits remaining", value: profile.credits === null ? "—" : profile.credits.toLocaleString() },
            { icon: Zap, label: "Runs this month", value: String(runCount) },
            { icon: TrendingUp, label: "Most used", value: mostUsed },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-surface-1 p-5 flex flex-col justify-between min-h-[110px]">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <s.icon className="h-3.5 w-3.5 text-primary" />
                  {s.label}
                </div>
                <div className="mt-3 text-2xl font-bold">{s.value}</div>
              </div>
              {s.label === "Credits remaining" && (
                <Link to="/transactions" className="mt-2 text-xs text-primary hover:underline inline-flex items-center gap-1">
                  View billing history <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-1 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent runs</h2>
            <Link to="/history" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              <HistoryIcon className="h-3 w-3" /> View history
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No runs yet. <Link to="/tools" className="text-primary hover:underline">Try a tool →</Link>
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{r.tool_name}</div>
                    <div className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</div>
                  </div>
                  <Link
                    to="/history"
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Favorites</h2>
            <Link to="/tools" className="text-xs text-primary hover:underline">Browse tools</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {favs.map((t) => {
              const cardContent = (
                <>
                  <div className="text-[11px] uppercase tracking-wider text-primary">{t.category}</div>
                  <div className="mt-1 text-sm font-medium group-hover:text-primary transition-colors flex items-center justify-between">
                    {t.name}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </>
              );

              const className = "group rounded-lg border border-border p-3 hover:border-primary transition-colors";

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
        </div>
      </section>
    </SiteLayout>
  );
}
