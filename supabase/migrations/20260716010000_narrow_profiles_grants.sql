-- ============================================================
-- Fix: Narrow profiles table grants for authenticated role
-- ============================================================
-- The original migration granted ALL privileges on profiles to
-- authenticated. While RLS enforces access rules, the broad
-- grant is unnecessary. This migration revokes DELETE and
-- INSERT permissions (the handle_new_user trigger handles
-- inserts via SECURITY DEFINER).
-- ============================================================

-- Revoke broad permissions
REVOKE ALL ON public.profiles FROM authenticated;

-- Grant only what's needed: read + update own profile
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
