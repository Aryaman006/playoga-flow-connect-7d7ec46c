
-- Add referral columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by uuid;

-- Create referrals table
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals as referrer"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

-- Users can view their own referral (as referred)
CREATE POLICY "Users can view own referral as referred"
ON public.referrals FOR SELECT
USING (auth.uid() = referred_user_id);

-- Admins can manage all referrals
CREATE POLICY "Admins can manage referrals"
ON public.referrals FOR ALL
USING (is_admin(auth.uid()));

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _code text;
  _exists boolean;
BEGIN
  -- Check if user already has a code
  SELECT referral_code INTO _code FROM profiles WHERE user_id = _user_id;
  IF _code IS NOT NULL THEN
    RETURN _code;
  END IF;

  -- Generate unique code
  LOOP
    _code := upper(substr(md5(random()::text || _user_id::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = _code) INTO _exists;
    EXIT WHEN NOT _exists;
  END LOOP;

  UPDATE profiles SET referral_code = _code WHERE user_id = _user_id;
  RETURN _code;
END;
$$;

-- Function to process referral on signup
CREATE OR REPLACE FUNCTION public.process_referral(_referred_user_id uuid, _referral_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _referrer_id uuid;
BEGIN
  -- Find referrer
  SELECT user_id INTO _referrer_id FROM profiles WHERE referral_code = _referral_code;
  IF _referrer_id IS NULL THEN RETURN; END IF;

  -- Prevent self-referral
  IF _referrer_id = _referred_user_id THEN RETURN; END IF;

  -- Check if already referred
  IF EXISTS(SELECT 1 FROM referrals WHERE referred_user_id = _referred_user_id) THEN RETURN; END IF;

  -- Update profile
  UPDATE profiles SET referred_by = _referrer_id WHERE user_id = _referred_user_id;

  -- Create pending referral
  INSERT INTO referrals (referrer_id, referred_user_id, status)
  VALUES (_referrer_id, _referred_user_id, 'pending');
END;
$$;

-- Function to complete referral when user subscribes
CREATE OR REPLACE FUNCTION public.complete_referral(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE referrals
  SET status = 'completed'
  WHERE referred_user_id = _user_id AND status = 'pending';
END;
$$;
