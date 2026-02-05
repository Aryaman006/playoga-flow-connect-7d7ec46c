-- Create admins table (only stores admin users)
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - only admins can view admins table
CREATE POLICY "Admins can view admins"
ON public.admins
FOR SELECT
USING (auth.uid() IN (SELECT user_id FROM public.admins));

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = _user_id
  )
$$;

-- Migrate existing admins from user_roles to admins table
INSERT INTO public.admins (user_id)
SELECT user_id FROM public.user_roles WHERE role = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- Update RLS policies on other tables to use is_admin instead of has_role
-- Categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (is_admin(auth.uid()));

-- Coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
ON public.coupons FOR ALL
USING (is_admin(auth.uid()));

-- Live sessions
DROP POLICY IF EXISTS "Admins can manage live sessions" ON public.live_sessions;
CREATE POLICY "Admins can manage live sessions"
ON public.live_sessions FOR ALL
USING (is_admin(auth.uid()));

-- Live session registrations
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.live_session_registrations;
CREATE POLICY "Admins can view all registrations"
ON public.live_session_registrations FOR SELECT
USING (is_admin(auth.uid()));

-- Payments
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments"
ON public.payments FOR ALL
USING (is_admin(auth.uid()));

-- Profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR ALL
USING (is_admin(auth.uid()));

-- Subscriptions
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions"
ON public.subscriptions FOR ALL
USING (is_admin(auth.uid()));

-- Videos
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can view all videos" ON public.videos;
CREATE POLICY "Admins can manage videos"
ON public.videos FOR ALL
USING (is_admin(auth.uid()));
CREATE POLICY "Admins can view all videos"
ON public.videos FOR SELECT
USING (is_admin(auth.uid()));

-- Watch progress
DROP POLICY IF EXISTS "Admins can view all progress" ON public.watch_progress;
CREATE POLICY "Admins can view all progress"
ON public.watch_progress FOR SELECT
USING (is_admin(auth.uid()));

-- Yogic points transactions
DROP POLICY IF EXISTS "Admins can view all points" ON public.yogic_points_transactions;
CREATE POLICY "Admins can view all points"
ON public.yogic_points_transactions FOR SELECT
USING (is_admin(auth.uid()));

-- Drop old user_roles table (no longer needed)
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Drop old has_role function
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

-- Drop old app_role enum
DROP TYPE IF EXISTS public.app_role;

-- Update handle_new_user trigger to not create user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, status)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$;