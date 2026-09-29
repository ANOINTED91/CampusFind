-- ============================================================
-- CampusFind Row Level Security Policies
-- Run this AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: check if current user is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- PROFILES policies
-- ============================================================

-- Anyone authenticated can read profiles (for display purposes)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin can update any profile (e.g., change roles)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- ITEMS policies
-- ============================================================

-- Everyone (including anonymous) can read active items
CREATE POLICY "items_select_public"
  ON public.items FOR SELECT
  USING (true);

-- Authenticated users can insert their own items
CREATE POLICY "items_insert_own"
  ON public.items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own items (e.g., edit description)
CREATE POLICY "items_update_own"
  ON public.items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update any item (e.g., change status)
CREATE POLICY "items_update_admin"
  ON public.items FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Users can delete their own items
CREATE POLICY "items_delete_own"
  ON public.items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can delete any item
CREATE POLICY "items_delete_admin"
  ON public.items FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- CLAIMS policies
-- ============================================================

-- Users can see their own claims
CREATE POLICY "claims_select_own"
  ON public.claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can see all claims
CREATE POLICY "claims_select_admin"
  ON public.claims FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Item owners can see claims on their items
CREATE POLICY "claims_select_item_owner"
  ON public.claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.items
      WHERE items.id = claims.item_id
        AND items.user_id = auth.uid()
    )
  );

-- Authenticated users can submit claims
CREATE POLICY "claims_insert_own"
  ON public.claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can update claim status (approve/reject)
CREATE POLICY "claims_update_admin"
  ON public.claims FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete claims
CREATE POLICY "claims_delete_admin"
  ON public.claims FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- STORAGE policies for item-images bucket
-- ============================================================

-- Anyone can view images (bucket is public, but this covers signed URLs)
CREATE POLICY "item_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

-- Authenticated users can upload images
CREATE POLICY "item_images_insert_authenticated"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'item-images');

-- Users can delete their own uploaded images
CREATE POLICY "item_images_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'item-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can delete any image
CREATE POLICY "item_images_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'item-images' AND public.is_admin());
