import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArrowLeft, Coins, Download, FileText, Loader2, Play, Upload } from "lucide-react";
import { useState } from "react";
import { saveToolRun } from "@/lib/tool-history";
import { downloadTxt, downloadMd } from "@/lib/download";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WEBHOOK_URL = (import.meta.env.VITE_PDF_EXTRACTOR_WEBHOOK_URL || "https://sly-saloon-backlands.ngrok-free.dev/webhook/PDF-extractor") as string;
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

export const Route = createFileRoute("/tools/pdf-extractor")({
  head: () => ({
    meta: [
      { title: "PDF Extractor — Ezverse" },
      { name: "description", content: "Upload a PDF and extract its text and structured data with AI." },
    ],
  }),
  component: PdfExtractor,
});

function formatResponse(data: unknown): string {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const preferred = obj.output ?? obj.result ?? obj.text ?? obj.message ?? obj.response ?? obj.content;
    if (typeof preferred === "string") return preferred;
    return JSON.stringify(data, null, 2);
  }
  return String(data);
}

function PdfExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [instructions, setInstructions] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (f && f.size > MAX_SIZE) {
      setError("File too large. Max 15MB.");
      return;
    }
    if (f && f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setFile(f);
  };

  const run = async () => {
    if (!user) {
      toast.error("You must be logged in to run tools.");
      return;
    }
    if (!file) return;
    setLoading(true);
    setOutput(null);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("filename", file.name);
      if (instructions.trim()) form.append("instructions", instructions.trim());

      const { error: rpcError } = await supabase.rpc("run_tool", {
        p_tool_slug: "pdf-extractor",
        p_input_data: { filename: file.name, instructions: instructions.trim() },
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

      const res = await fetch(WEBHOOK_URL, { method: "POST", body: form });
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
          toolSlug: "pdf-extractor",
          toolName: "PDF Extractor",
          input: { filename: file.name, size: file.size, instructions: instructions.trim() || null },
          output: msg,
          status: "error",
        });
      } else {
        const out = formatResponse(parsed) || "(empty response)";
        setOutput(out);
        void saveToolRun({
          toolSlug: "pdf-extractor",
          toolName: "PDF Extractor",
          input: { filename: file.name, size: file.size, instructions: instructions.trim() || null },
          output: out,
        });
        toast.success("Extraction completed successfully.");
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
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">PDF Extractor</h1>
            <p className="mt-2 text-muted-foreground max-w-xl">
              Upload a PDF and extract clean text, tables, or specific fields. Add optional instructions to target what you need.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1.5 text-xs">
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span>4 credits / run</span>
          </div>
        </div>
      </section>

      <section className="container-page pb-24 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-1 p-6 space-y-4">
          <div>
            <label htmlFor="pdf-file" className="text-sm font-semibold">
              PDF file
            </label>
            <label
              htmlFor="pdf-file"
              className="mt-2 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-background p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
            >
              {file ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-sm font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · click to replace</div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">Click to upload a PDF</div>
                  <div className="text-xs text-muted-foreground">Max 15MB</div>
                </>
              )}
              <input id="pdf-file" type="file" accept="application/pdf,.pdf" onChange={onFileChange} className="hidden" />
            </label>
          </div>
          <div>
            <label htmlFor="instructions" className="text-sm font-semibold">
              Extraction instructions <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Extract all invoice line items as JSON with description, qty, unit_price, total."
              rows={6}
              className="mt-2 w-full rounded-md bg-background border border-border p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={run}
            disabled={loading || !file}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {loading ? "Extracting..." : "Extract PDF · 4 credits"}
          </button>
        </div>

        <div className="rounded-xl border border-border bg-surface-1 p-6 min-h-[280px]">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">Extraction result</div>
            {output && !loading && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadTxt("pdf-extractor", output)}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium border border-border rounded-md hover:border-primary hover:text-primary transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> .txt
                </button>
                <button
                  onClick={() => downloadMd("pdf-extractor", output)}
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
                <p className="text-sm">Reading the PDF… this can take up to a minute.</p>
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
              <p className="text-sm text-muted-foreground">Upload a PDF and click Extract to see the result here.</p>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
