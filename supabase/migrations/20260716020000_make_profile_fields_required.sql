-- ============================================================
-- Make full_name and phone required, phone unique
-- ============================================================
-- Ensures every profile has a name and phone number, and
-- phone numbers are unique across all accounts.
-- ============================================================

-- Backfill existing NULLs (admin account created before constraints)
UPDATE public.profiles
SET full_name = 'Admin', phone = '+910000000000'
WHERE full_name IS NULL OR phone IS NULL;

-- Make required
ALTER TABLE public.profiles
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL;

-- Unique phone
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);

-- Update trigger to include phone from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;
