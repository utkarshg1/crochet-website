-- ============================================================
-- Add check_email_exists() function
-- ============================================================
-- Allows the client to check if an email is registered before
-- sending an OTP. SECURITY DEFINER so it can query auth.users.
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_email_exists(check_email text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE email = check_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_email_exists(text) TO authenticated, anon;
