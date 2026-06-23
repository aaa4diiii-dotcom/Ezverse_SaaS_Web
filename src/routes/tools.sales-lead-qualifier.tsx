import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft, Coins, Download, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { saveToolRun } from "@/lib/tool-history";
import { downloadTxt, downloadMd } from "@/lib/download";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WEBHOOK_URL = (import.meta.env.VITE_SALES_LEAD_QUALIFIER_WEBHOOK_URL || "https://sly-saloon-backlands.ngrok-free.dev/webhook/sales-lead-extract") as string;

export const Route = createFileRoute("/tools/sales-lead-qualifier")({
  head: () => ({
    meta: [
      { title: "Sales Lead Qualifier — Ezverse" },
      { name: "description", content: "Qualify LinkedIn leads against your criteria with AI." },
    ],
  }),
  component: SalesLeadQualifier,
});

function formatResponse(data: unknown): string {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const preferred = obj.output ?? obj.result ?? obj.message ?? obj.text ?? obj.response;
    if (typeof preferred === "string") return preferred;
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

function SalesLeadQualifier() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [criteria, setCriteria] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const run = async () => {
    if (!user) {
      toast.error("You must be logged in to run tools.");
      return;
    }
    if (!linkedinUrl.trim() || !criteria.trim()) return;
    setLoading(true);
    setOutput(null);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc("run_tool", {
        p_tool_slug: "sales-lead-qualifier",
        p_input_data: { linkedin_url: linkedinUrl.trim(), qualification_criteria: criteria.trim() },
      });

      if (rpcError) {
        if (rpcError.message.includes("Insufficient credits")) {
          toast.error("You do not have enough credits to run this tool. Please top up.");
          navigate({ to: "/pricing" });
        } else {
          toast.error(rpcError.message);
        }
        setLoading(false);
        return;
      }

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedin_url: linkedinUrl.trim(),
          qualification_criteria: criteria.trim(),
        }),
      });
      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        // keep as text
      }
      if (!res.ok) {
        const msg = `Webhook returned ${res.status}: ${formatResponse(parsed) || res.statusText}`;
        setError(msg);
        void saveToolRun({
          toolSlug: "sales-lead-qualifier",
          toolName: "Sales Lead Qualifier",
          input: { linkedin_url: linkedinUrl.trim(), qualification_criteria: criteria.trim() },
          output: msg,
          status: "error",
        });
      } else {
        const out = formatResponse(parsed) || "(empty response)";
        setOutput(out);
        void saveToolRun({
          toolSlug: "sales-lead-qualifier",
          toolName: "Sales Lead Qualifier",
          input: { linkedin_url: linkedinUrl.trim(), qualification_criteria: criteria.trim() },
          output: out,
        });
        toast.success("Lead qualification completed successfully.");
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reach webhook.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-8">
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="mt-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-primary">Data</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Sales Lead Qualifier</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Paste a LinkedIn profile URL and your qualification criteria. We'll score and summarize the lead.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1.5 text-xs">
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span>5 credits / run</span>
          </div>
        </div>
      </section>

      <section className="container-page pb-24 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-1 p-6 space-y-4">
          <div>
            <label htmlFor="linkedin-url" className="text-sm font-semibold">
              LinkedIn URL
            </label>
            <input
              id="linkedin-url"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/jane-doe"
              className="mt-2 w-full rounded-md bg-background border border-border p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label htmlFor="criteria" className="text-sm font-semibold">
              Qualification criteria
            </label>
            <textarea
              id="criteria"
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="e.g. B2B SaaS founders or heads of sales at 10-200 employee companies in North America with revenue $1M-$20M."
              rows={7}
              className="mt-2 w-full rounded-md bg-background border border-border p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={run}
            disabled={loading || !linkedinUrl.trim() || !criteria.trim()}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? "Qualifying..." : "Qualify lead · 5 credits"}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-6 min-h-[280px]">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">Qualification result</div>
            {output && !loading && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadTxt("sales-lead-qualifier", output)}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> .txt
                </button>
                <button
                  onClick={() => downloadMd("sales-lead-qualifier", output)}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> .md
                </button>
              </div>
            )}
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Analyzing the lead… this can take up to a minute.</p>
                <div className="w-full space-y-2 mt-4">
                  <div className="h-3 rounded bg-primary/10 animate-pulse" />
                  <div className="h-3 rounded bg-primary/10 animate-pulse w-5/6" />
                  <div className="h-3 rounded bg-primary/10 animate-pulse w-4/6" />
                </div>
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive whitespace-pre-wrap">
                {error}
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{output}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">Submit a lead to see the qualification result here.</p>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
