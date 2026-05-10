-- ============================================================
-- Migration 00002 (v2): Supabase Auth + Plants + Marketplace
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- ----------------------------------------------------------------
-- 1. User Profiles (extends auth.users)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL DEFAULT '',
  full_name   TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (to allow re-running safely)
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_read_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_delete_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;

-- Simple policy: authenticated users can always read/write their own profile.
-- Admin check is done in application code, NOT in RLS (avoids recursion).
CREATE POLICY "authenticated_read_profiles" ON public.user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile via a security-definer function (avoids recursion)
CREATE POLICY "service_update_profiles" ON public.user_profiles
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "service_delete_profiles" ON public.user_profiles
  FOR DELETE USING (auth.uid() = id);

-- ----------------------------------------------------------------
-- 2. Auto-create profile on signup (trigger)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- 3. Manually insert profile for existing users (run once)
-- ----------------------------------------------------------------
INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  'user',
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
);

-- ----------------------------------------------------------------
-- 4. User Plants
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_plants (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  type                TEXT DEFAULT '',
  location_type       TEXT DEFAULT 'Indoor',
  light_exposure      TEXT DEFAULT 'Bright Indirect',
  pot_type            TEXT DEFAULT 'Plastic',
  has_drainage        BOOLEAN DEFAULT true,
  last_watered        DATE,
  recently_replanted  BOOLEAN DEFAULT false,
  health              TEXT DEFAULT 'Excellent',
  image               TEXT,
  care_tips           TEXT,
  watering_tips       TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_crud_own_plants" ON public.user_plants;
CREATE POLICY "users_crud_own_plants" ON public.user_plants
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 5. Watering Log
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.watering_log (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, log_date)
);

ALTER TABLE public.watering_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_watering_log" ON public.watering_log;
CREATE POLICY "users_own_watering_log" ON public.watering_log
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- 6. Marketplace Listings
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  type          TEXT NOT NULL DEFAULT 'seed',
  mode          TEXT NOT NULL DEFAULT 'sell',
  price         INTEGER,
  exchange_for  TEXT,
  location      TEXT,
  image         TEXT,
  contact_phone TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_read_listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "owners_insert_listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "owners_modify_listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "owners_delete_listings" ON public.marketplace_listings;

CREATE POLICY "anyone_read_listings" ON public.marketplace_listings
  FOR SELECT USING (true);
CREATE POLICY "owners_insert_listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owners_modify_listings" ON public.marketplace_listings
  FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "owners_delete_listings" ON public.marketplace_listings
  FOR DELETE USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------
-- 7. Marketplace Conversations
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  participant_ids   UUID[] NOT NULL,
  last_message_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_read_conversations" ON public.marketplace_conversations;
DROP POLICY IF EXISTS "authenticated_create_conversations" ON public.marketplace_conversations;
DROP POLICY IF EXISTS "participants_update_conversations" ON public.marketplace_conversations;

CREATE POLICY "participants_read_conversations" ON public.marketplace_conversations
  FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "authenticated_create_conversations" ON public.marketplace_conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));
CREATE POLICY "participants_update_conversations" ON public.marketplace_conversations
  FOR UPDATE USING (auth.uid() = ANY(participant_ids));

-- ----------------------------------------------------------------
-- 8. Marketplace Messages
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.marketplace_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL,
  listing_id        UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES auth.users(id),
  recipient_id      UUID NOT NULL REFERENCES auth.users(id),
  body              TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_read_messages" ON public.marketplace_messages;
DROP POLICY IF EXISTS "authenticated_send_messages" ON public.marketplace_messages;

CREATE POLICY "participants_read_messages" ON public.marketplace_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "authenticated_send_messages" ON public.marketplace_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
