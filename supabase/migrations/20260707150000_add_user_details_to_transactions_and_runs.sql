-- Add user_email and user_name columns to public.transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Add user_email and user_name columns to public.tool_runs
ALTER TABLE public.tool_runs 
ADD COLUMN IF NOT EXISTS user_email text,
ADD COLUMN IF NOT EXISTS user_name text;

-- Backfill existing rows in transactions
UPDATE public.transactions t
SET 
  user_email = COALESCE(p.email, u.email),
  user_name = COALESCE(p.name, '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE t.user_id = u.id;

-- Backfill existing rows in tool_runs
UPDATE public.tool_runs r
SET 
  user_email = COALESCE(p.email, u.email),
  user_name = COALESCE(p.name, '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE r.user_id = u.id;

-- Create trigger function to auto-populate columns on insert
CREATE OR REPLACE FUNCTION public.populate_user_details()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Fetch email and name from profiles table
  SELECT email, name INTO NEW.user_email, NEW.user_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Fallback to auth.users if profiles has no email yet (e.g. signup flow)
  IF NEW.user_email IS NULL THEN
    SELECT email INTO NEW.user_email
    FROM auth.users
    WHERE id = NEW.user_id;
  END IF;

  -- Fallback for name to avoid nulls
  IF NEW.user_name IS NULL THEN
    NEW.user_name := '';
  END IF;

  RETURN NEW;
END;
$$;

-- Create BEFORE INSERT trigger on public.transactions
DROP TRIGGER IF EXISTS trigger_populate_transaction_user_details ON public.transactions;
CREATE TRIGGER trigger_populate_transaction_user_details
BEFORE INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.populate_user_details();

-- Create BEFORE INSERT trigger on public.tool_runs
DROP TRIGGER IF EXISTS trigger_populate_tool_runs_user_details ON public.tool_runs;
CREATE TRIGGER trigger_populate_tool_runs_user_details
BEFORE INSERT ON public.tool_runs
FOR EACH ROW
EXECUTE FUNCTION public.populate_user_details();
