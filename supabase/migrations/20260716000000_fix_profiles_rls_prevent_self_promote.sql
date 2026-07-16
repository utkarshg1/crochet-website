-- ============================================================
-- Fix: Prevent users from self-promoting to admin via RLS
-- ============================================================
-- The original "Profiles: user can update own" policy allowed
-- any authenticated user to set is_admin = true on their own
-- profile because WITH CHECK only validated row ownership, not
-- which columns were modified.
--
-- This migration replaces the policy with one that locks the
-- is_admin column: users can update their own profile, but
-- is_admin must remain unchanged. Only service_role (used by
-- edge functions and admin dashboard server code) can change it.
-- ============================================================

-- Drop the old permissive policy
DROP POLICY IF EXISTS "Profiles: user can update own" ON public.profiles;

-- Create restrictive replacement that locks is_admin
CREATE POLICY "Profiles: user can update own (no self-promote)"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK (
    (select auth.uid()) = id
    AND is_admin = (
      SELECT p.is_admin FROM public.profiles p WHERE p.id = (select auth.uid())
    )
  );
