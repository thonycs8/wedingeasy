
-- Fix: Make public SELECT policies PERMISSIVE so anonymous users can access event pages

-- wedding_data: drop restrictive public policy and recreate as permissive
DROP POLICY IF EXISTS "Public can view active wedding basic data" ON public.wedding_data;
CREATE POLICY "Public can view active wedding basic data"
  ON public.wedding_data
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- wedding_landing_pages: drop restrictive public policy and recreate as permissive
DROP POLICY IF EXISTS "Public can view published landing pages" ON public.wedding_landing_pages;
CREATE POLICY "Public can view published landing pages"
  ON public.wedding_landing_pages
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);
