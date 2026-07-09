import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Clock, Download, FileText, Trash2, Loader2, History as HistoryIcon, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchToolRuns, deleteToolRun, type ToolRun } from "@/lib/tool-history";
import { downloadTxt, downloadMd } from "@/lib/download";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Ezverse" },
      { name: "description", content: "Browse and download your previous tool runs." },
    ],
  }),
  component: HistoryPage,
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [runs, setRuns] = useState<ToolRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "admin">("personal");
  const [profiles, setProfiles] = useState<Record<string, { name: string; email: string }>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    async function loadHistory() {
      try {
        const rows = await fetchToolRuns();
        if (cancelled) return;
        setRuns(rows);
        setActiveId(rows[0]?.id ?? null);

        // Fetch user roles
        const { data: roles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;
        const userIsAdmin = roles?.some((r: any) => r.role === "admin") || false;
        
        if (cancelled) return;
        setIsAdmin(userIsAdmin);
        if (userIsAdmin) {
          setActiveTab("admin");
        }

        // Fetch profiles if admin
        if (userIsAdmin) {
          const { data: userProfiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, email");
          
          if (!profilesError && userProfiles && !cancelled) {
            const profs: Record<string, { name: string; email: string }> = {};
            userProfiles.forEach((p: any) => {
              profs[p.id] = { name: p.name || "", email: p.email || "" };
            });
            setProfiles(profs);
          }
        }
      } catch (e: any) {
        toast.error(e instanceof Error ? e.message : "Failed to load history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const displayedRuns = activeTab === "admin" && isAdmin
    ? runs
    : runs.filter((r) => r.user_id === user?.id);

  const active = displayedRuns.find((r) => r.id === activeId) ?? displayedRuns[0] ?? null;

  const handleDelete = async (id: string) => {
    const prev = runs;
    setRuns((rs) => rs.filter((r) => r.id !== id));
    if (activeId === id) setActiveId(null);
    try {
      await deleteToolRun(id);
      toast.success("Run deleted");
    } catch (e) {
      setRuns(prev);
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  if (!authLoading && !user) {
    return (
      <SiteLayout>
        <section className="container-page py-24 text-center">
          <HistoryIcon className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Sign in to view your history</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your tool runs are saved to your account.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center h-10 px-5 text-sm font-semibold border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center h-10 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <HistoryIcon className="h-7 w-7 text-primary" /> History
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your previous tool runs. Click any run to view, download or delete it.
            </p>
          </div>
          <button
            onClick={() => router.invalidate()}
            className="inline-flex items-center h-9 px-4 text-sm font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
          >
            Refresh
          </button>
        </div>
        {isAdmin && (
          <div className="mt-8 flex gap-2 border-b border-border pb-px">
            <button
              onClick={() => setActiveTab("admin")}
              className={`pb-3 text-sm font-semibold px-4 transition-colors relative ${
                activeTab === "admin"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                All User Runs (Admin View)
              </div>
            </button>
            <button
              onClick={() => setActiveTab("personal")}
              className={`pb-3 text-sm font-semibold px-4 transition-colors relative ${
                activeTab === "personal"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                My Runs
              </div>
            </button>
          </div>
        )}
      </section>

      <section className="container-page pb-24 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="rounded-xl border border-border bg-surface-1 overflow-hidden">
          {loading ? (
            <div className="p-10 flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">Loading history…</span>
            </div>
          ) : displayedRuns.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground font-semibold">No runs found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeTab === "admin" 
                  ? "No tool runs have been logged in the system yet."
                  : "You haven't run any tools yet."}
              </p>
              {activeTab === "personal" && (
                <Link to="/tools" className="mt-3 inline-block text-sm text-primary hover:underline">
                  Try a tool →
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-border max-h-[70vh] overflow-y-auto">
              {displayedRuns.map((r) => {
                const isActive = r.id === activeId;
                const prof = profiles[r.user_id];
                const userName = prof?.name || "No Name";
                const userEmail = prof?.email || "Unknown User";

                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setActiveId(r.id)}
                      className={`w-full text-left px-4 py-3 transition-colors ${
                        isActive ? "bg-primary/10" : "hover:bg-surface-2"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium truncate">{r.tool_name}</div>
                        {r.status !== "success" && (
                          <span className="text-[10px] uppercase tracking-wider text-destructive">
                            {r.status}
                          </span>
                        )}
                      </div>
                      {activeTab === "admin" && isAdmin && (
                        <div className="text-[11px] font-semibold text-foreground/80 mt-1 truncate">
                          User: {userName} ({userEmail.split('@')[0]})
                        </div>
                      )}
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatDate(r.created_at)}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-6 min-h-[320px]">
          {active ? (
            <>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-primary">
                    {active.tool_slug}
                  </div>
                  <h2 className="mt-1 text-xl font-bold">{active.tool_name}</h2>
                  <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDate(active.created_at)}
                  </div>
                </div>
                
                {activeTab === "admin" && isAdmin && (
                  <div className="mt-3 w-full rounded-lg border border-border bg-surface-2 p-3 text-xs">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary" /> User Details
                    </div>
                    <div className="mt-1.5 grid gap-1">
                      <div><span className="text-muted-foreground">Name:</span> <span className="font-semibold">{profiles[active.user_id]?.name || "No Name"}</span></div>
                      <div><span className="text-muted-foreground">Email:</span> <span className="font-semibold">{profiles[active.user_id]?.email || "Unknown User"}</span></div>
                      <div className="flex items-center gap-1 mt-0.5"><span className="text-muted-foreground">UID:</span> <code className="font-mono text-muted-foreground/80 bg-background/50 px-1 py-0.5 rounded text-[10px]">{active.user_id}</code></div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadTxt(active.tool_slug, active.output ?? "")}
                    className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> .txt
                  </button>
                  <button
                    onClick={() => downloadMd(active.tool_slug, active.output ?? "")}
                    className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> .md
                  </button>
                  <button
                    onClick={() => handleDelete(active.id)}
                    className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium border border-border rounded-md text-destructive hover:border-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>

              {active.input && Object.keys(active.input as object).length > 0 && (
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Inputs</div>
                  <pre className="mt-2 rounded-md bg-background border border-border p-3 text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(active.input, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Output</div>
                <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed rounded-md bg-background border border-border p-4">
                  {active.output || "(empty)"}
                </pre>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Select a run on the left to view details.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
