import { supabase } from "@/integrations/supabase/client";

export type ToolRun = {
  id: string;
  user_id: string;
  tool_slug: string;
  tool_name: string;
  input: Record<string, unknown> | unknown;
  output: string | null;
  status: string;
  created_at: string;
};

export async function saveToolRun(params: {
  toolSlug: string;
  toolName: string;
  input: Record<string, unknown>;
  output: string;
  status?: "success" | "error";
}): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return; // not logged in — silently skip
  await supabase.from("tool_runs").insert({
    user_id: userId,
    tool_slug: params.toolSlug,
    tool_name: params.toolName,
    input: params.input as never,
    output: params.output,
    status: params.status ?? "success",
  });
}

export async function fetchToolRuns(limit = 100): Promise<ToolRun[]> {
  const { data, error } = await supabase
    .from("tool_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as ToolRun[];
}

export async function deleteToolRun(id: string): Promise<void> {
  const { error } = await supabase.from("tool_runs").delete().eq("id", id);
  if (error) throw error;
}
