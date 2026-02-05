-- Fix RLS policies to explicitly deny anonymous access

-- PROFILES: Drop and recreate policies with proper PERMISSIVE semantics
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create PERMISSIVE policies (default) that require authentication
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- PAYMENTS: Drop and recreate policies with proper role targeting
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;

CREATE POLICY "Users can view own payments" 
ON public.payments FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage payments" 
ON public.payments FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- SUBSCRIPTIONS: Drop and recreate policies with proper role targeting
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscription" 
ON public.subscriptions FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions" 
ON public.subscriptions FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));

-- COUPONS: Drop and recreate policy with proper role targeting  
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

CREATE POLICY "Admins can manage coupons" 
ON public.coupons FOR ALL 
TO authenticated
USING (is_admin(auth.uid()));