import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { type ToolCategory } from "@/lib/tools-data";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Coins, Loader2, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { saveToolRun } from "@/lib/tool-history";

export const Route = createFileRoute("/tools/$slug")({
  loader: async ({ params }) => {
    const { data: tool, error } = await supabase.from("tools").select("*").eq("slug", params.slug).maybeSingle();
    if (error || !tool) throw notFound();
    return { 
      tool: {
        slug: tool.slug,
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        category: tool.category as ToolCategory,
        credits: tool.credits,
        popular: tool.popular ?? false,
        inputLabel: tool.input_label,
        inputPlaceholder: tool.input_placeholder,
        sampleOutput: tool.sample_output,
      } 
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.tool.name} — Ezverse` },
          { name: "description", content: loaderData.tool.description },
        ]
      : [],
  }),
  component: ToolDetail,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-bold">Tool not found</h1>
        <Link to="/tools" className="mt-4 inline-block text-primary hover:underline">
          ← Back to all tools
        </Link>
      </div>
    </SiteLayout>
  ),
});

function ToolDetail() {
  const { tool } = Route.useLoaderData();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!user) {
      toast.error("You must be logged in to run tools.");
      return;
    }
    if (!input.trim()) return;
    setLoading(true);
    setOutput(null);

    const { data, error } = await supabase.rpc("run_tool", {
      p_tool_slug: tool.slug,
      p_input_data: { text: input },
    });

    setLoading(false);

    if (error) {
      if (error.message.includes("Insufficient credits")) {
        toast.error("You do not have enough credits to run this tool. Please top up.");
        navigate({ to: "/pricing" });
      } else {
        toast.error(error.message);
      }
      return;
    }

    const result = data as { success: boolean; remaining_credits: number; output: string };
    setOutput(result.output);
    toast.success(`Run successful. ${result.remaining_credits} credits remaining.`);
    
    void saveToolRun({
      toolSlug: tool.slug,
      toolName: tool.name,
      input: { text: input },
      output: result.output,
    });
    
    // Invalidate profile query to update credit counter
    queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  return (
    <SiteLayout>
      <section className="container-page pt-12 pb-8">
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All tools
        </Link>
        <div className="mt-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-primary">{tool.category}</span>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">{tool.name}</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">{tool.description}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1.5 text-xs">
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span>{tool.credits} credits / run</span>
          </div>
        </div>
      </section>

      <section className="container-page pb-24 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-1 p-6">
          <label htmlFor="tool-input" className="text-sm font-semibold">
            {tool.inputLabel}
          </label>
          <textarea
            id="tool-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tool.inputPlaceholder}
            rows={8}
            className="mt-3 w-full rounded-md bg-background border border-border p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={run}
            disabled={loading || !input.trim()}
            className="mt-4 inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? "Running..." : `Run · ${tool.credits} credits`}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-6 min-h-[280px]">
          <div className="text-sm font-semibold">Output</div>
          <div className="mt-3">
            {loading ? (
              <div className="space-y-2">
                <div className="h-3 rounded bg-primary/10 animate-pulse" />
                <div className="h-3 rounded bg-primary/10 animate-pulse w-5/6" />
                <div className="h-3 rounded bg-primary/10 animate-pulse w-4/6" />
              </div>
            ) : output ? (
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">{output}</pre>
            ) : (
              <p className="text-sm text-muted-foreground">Run the tool to see results here.</p>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
