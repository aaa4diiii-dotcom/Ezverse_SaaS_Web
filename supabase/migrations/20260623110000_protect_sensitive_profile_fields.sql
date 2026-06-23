-- Create a trigger function to block direct client-side updates to sensitive columns in profiles
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the current user role is authenticated or anon (which corresponds to client-side API requests)
  IF current_user = 'authenticated' OR current_user = 'anon' THEN
    -- If they tried to change credits, force it back to the original value
    IF NEW.credits IS DISTINCT FROM OLD.credits THEN
      NEW.credits := OLD.credits;
    END IF;
    
    -- If they tried to change stripe_customer_id, force it back to the original value
    IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
      NEW.stripe_customer_id := OLD.stripe_customer_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the BEFORE UPDATE trigger on profiles
DROP TRIGGER IF EXISTS preserve_sensitive_profile_fields_trigger ON public.profiles;
CREATE TRIGGER preserve_sensitive_profile_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_sensitive_profile_columns();

-- Revoke all direct execute rights on the protect trigger function from public
REVOKE ALL ON FUNCTION public.protect_sensitive_profile_columns() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.protect_sensitive_profile_columns() TO service_role;
