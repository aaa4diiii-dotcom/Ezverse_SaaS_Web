-- Create or replace the handle_new_user function to log a signup transaction
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    50
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(public.profiles.name, ''), EXCLUDED.name),
    credits = COALESCE(public.profiles.credits, EXCLUDED.credits),
    updated_at = now();

  -- Log the signup bonus in transactions
  INSERT INTO public.transactions (user_id, tool_id, input_data, credits_used, status)
  VALUES (NEW.id, NULL, NULL, -50, 'signup_bonus');

  RETURN NEW;
END;
$$;

-- Create the secure RPC function to run a tool
CREATE OR REPLACE FUNCTION public.run_tool(p_tool_slug text, p_input_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_tool_id uuid;
  v_tool_credits integer;
  v_sample_output text;
  v_current_credits integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch tool information
  SELECT id, credits, sample_output INTO v_tool_id, v_tool_credits, v_sample_output
  FROM public.tools WHERE slug = p_tool_slug;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tool not found';
  END IF;

  -- Fetch user profile credits with row lock to prevent race conditions
  SELECT credits INTO v_current_credits FROM public.profiles WHERE id = v_user_id FOR UPDATE;

  IF v_current_credits < v_tool_credits THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct credits
  UPDATE public.profiles SET credits = credits - v_tool_credits WHERE id = v_user_id;

  -- Record transaction
  INSERT INTO public.transactions (user_id, tool_id, input_data, credits_used, status)
  VALUES (v_user_id, v_tool_id, p_input_data, v_tool_credits, 'completed');

  -- Return success response with sample output
  RETURN jsonb_build_object(
    'success', true,
    'remaining_credits', v_current_credits - v_tool_credits,
    'output', v_sample_output
  );
END;
$$;

-- Ensure authenticated users can call the RPC
GRANT EXECUTE ON FUNCTION public.run_tool(text, jsonb) TO authenticated;
