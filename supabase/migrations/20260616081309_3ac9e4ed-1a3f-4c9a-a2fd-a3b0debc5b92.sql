
CREATE TABLE public.tool_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tool_runs TO authenticated;
GRANT ALL ON public.tool_runs TO service_role;

ALTER TABLE public.tool_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tool runs"
  ON public.tool_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool runs"
  ON public.tool_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tool runs"
  ON public.tool_runs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX tool_runs_user_created_idx ON public.tool_runs (user_id, created_at DESC);
