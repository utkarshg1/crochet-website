-- ============================================================
-- Fix: Replace all recursive RLS admin-check policies
-- ============================================================
-- Every admin-check policy across 6 tables used:
--   exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true)
-- This subqueries `profiles` FROM a policy ON `profiles`, causing infinite recursion.
--
-- Fix: Create SECURITY DEFINER functions that bypass RLS,
-- then reference them in all policies.
-- ============================================================

-- ─── Helper functions (SECURITY DEFINER = bypass RLS) ─────────

-- Check if a user is admin (used by all admin-check policies)
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND is_admin = true
  );
$$;

-- Read a user's current is_admin value (used by the self-promote guard)
CREATE OR REPLACE FUNCTION public.get_profile_admin_status(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT is_admin FROM public.profiles WHERE id = uid;
$$;

-- Grant execute to authenticated only (anon doesn't need admin checks)
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_admin_status(uuid) TO authenticated;

-- ─── profiles ────────────────────────────────────────────────

-- Drop the recursive SELECT policy
DROP POLICY IF EXISTS "Profiles: admin can read all" ON public.profiles;

-- Recreate without recursion — still lets admins read all profiles,
-- but now calls the SECURITY DEFINER function instead of subquerying profiles
CREATE POLICY "Profiles: admin can read all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- Drop the recursive UPDATE policy (self-promote guard)
DROP POLICY IF EXISTS "Profiles: user can update own (no self-promote)" ON public.profiles;

-- Recreate with SECURITY DEFINER function for the is_admin check
CREATE POLICY "Profiles: user can update own (no self-promote)"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK (
    (select auth.uid()) = id
    AND is_admin = public.get_profile_admin_status((select auth.uid()))
  );

-- ─── categories ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Categories: admin can insert" ON public.categories;
CREATE POLICY "Categories: admin can insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Categories: admin can update" ON public.categories;
CREATE POLICY "Categories: admin can update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Categories: admin can delete" ON public.categories;
CREATE POLICY "Categories: admin can delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- ─── products ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Products: admin can insert" ON public.products;
CREATE POLICY "Products: admin can insert"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Products: admin can update" ON public.products;
CREATE POLICY "Products: admin can update"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Products: admin can delete" ON public.products;
CREATE POLICY "Products: admin can delete"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- ─── orders ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Orders: admin can read all" ON public.orders;
CREATE POLICY "Orders: admin can read all"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Orders: admin can update all" ON public.orders;
CREATE POLICY "Orders: admin can update all"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

-- ─── discounts ───────────────────────────────────────────────

DROP POLICY IF EXISTS "Discounts: admin can read all" ON public.discounts;
CREATE POLICY "Discounts: admin can read all"
  ON public.discounts FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Discounts: admin can insert" ON public.discounts;
CREATE POLICY "Discounts: admin can insert"
  ON public.discounts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Discounts: admin can update" ON public.discounts;
CREATE POLICY "Discounts: admin can update"
  ON public.discounts FOR UPDATE
  TO authenticated
  USING (public.is_admin((select auth.uid())))
  WITH CHECK (public.is_admin((select auth.uid())));

DROP POLICY IF EXISTS "Discounts: admin can delete" ON public.discounts;
CREATE POLICY "Discounts: admin can delete"
  ON public.discounts FOR DELETE
  TO authenticated
  USING (public.is_admin((select auth.uid())));

-- ─── newsletter_subscribers ──────────────────────────────────

DROP POLICY IF EXISTS "Newsletter: admin can read all" ON public.newsletter_subscribers;
CREATE POLICY "Newsletter: admin can read all"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (public.is_admin((select auth.uid())));
