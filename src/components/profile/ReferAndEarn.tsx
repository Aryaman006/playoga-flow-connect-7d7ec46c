import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ReferAndEarnProps {
  userId: string;
  hasActiveSubscription: boolean;
}

const COMMISSION_PER_REFERRAL = 50;

export const ReferAndEarn: React.FC<ReferAndEarnProps> = ({ userId, hasActiveSubscription }) => {
  const { data: referralCode } = useQuery({
    queryKey: ['referral-code', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data?.referral_code as string | null;
    },
    enabled: hasActiveSubscription,
  });

  const { data: referralStats } = useQuery({
    queryKey: ['referral-stats', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', userId);
      if (error) throw error;
      const total = data?.length || 0;
      const completed = data?.filter((r) => r.status === 'completed').length || 0;
      return { total, completed, earnings: completed * COMMISSION_PER_REFERRAL };
    },
    enabled: hasActiveSubscription,
  });

  if (!hasActiveSubscription) return null;

  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : '';

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Refer & Earn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Earn ₹{COMMISSION_PER_REFERRAL} for every paid subscriber you refer
        </p>

        {referralCode ? (
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="text-xs" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Generating your referral code...</p>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Referrals</span>
            <span className="font-medium">{referralStats?.total || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Successful (Paid)</span>
            <span className="font-medium">{referralStats?.completed || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Earnings</span>
            <span className="font-medium">₹{referralStats?.earnings || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
