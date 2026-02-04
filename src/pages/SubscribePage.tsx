import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Crown,
  Check,
  Sparkles,
  Video,
  Calendar,
  Shield,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const SubscribePage: React.FC = () => {
  const { user, hasActiveSubscription, refreshSubscriptionStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const basePrice = 999;
  const gstRate = 0.05;
  const discountedPrice = basePrice - discount;
  const gstAmount = discountedPrice * gstRate;
  const totalAmount = discountedPrice + gstAmount;

  const features = [
    { icon: Video, text: 'Unlimited access to all premium videos' },
    { icon: Calendar, text: 'Join exclusive live yoga sessions' },
    { icon: Sparkles, text: 'Earn 2x Yogic Points on all sessions' },
    { icon: Shield, text: 'Ad-free experience' },
  ];

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    // In a real app, this would validate the coupon with the backend
    // For now, we'll simulate a discount
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (couponCode.toUpperCase() === 'YOGA100') {
      setDiscount(100);
      toast.success('Coupon applied! ₹100 off');
    } else {
      toast.error('Invalid coupon code');
    }
    setIsApplyingCoupon(false);
  };

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setIsProcessing(true);
    
    // In a real implementation, this would integrate with Razorpay
    // For demo purposes, we'll simulate a successful payment
    toast.info('Payment integration pending', {
      description: 'Razorpay integration will be added with API key',
    });
    
    setIsProcessing(false);
  };

  if (hasActiveSubscription) {
    return (
      <UserLayout>
        <div className="content-container py-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-success" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">
              You're Already Premium!
            </h1>
            <p className="text-muted-foreground mb-8">
              You have full access to all premium content. Enjoy your yoga journey!
            </p>
            <Button asChild className="bg-gradient-warm">
              <Link to="/browse">
                Browse Premium Content
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="content-container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gold/10 text-gold mb-6">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Premium Membership</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Unlock Your Full Potential
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get unlimited access to all premium yoga classes, live sessions, 
              and exclusive content for just ₹999/year.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Features */}
            <div className="bg-card border border-border rounded-3xl p-8">
              <h2 className="font-display text-2xl font-semibold mb-6">
                What's Included
              </h2>
              <div className="space-y-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-muted/50">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-charcoal to-terracotta-dark rounded-3xl p-8 text-white">
              <div className="text-center mb-8">
                <span className="text-sm text-white/70">Yearly Plan</span>
                <div className="mt-2">
                  <span className="text-5xl font-display font-bold">₹{discountedPrice}</span>
                  <span className="text-white/70">/year</span>
                </div>
                {discount > 0 && (
                  <div className="mt-2 text-sm text-gold">
                    You save ₹{discount}!
                  </div>
                )}
              </div>

              {/* Coupon Input */}
              <div className="mb-6">
                <Label htmlFor="coupon" className="text-white/70">
                  Have a coupon?
                </Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={isApplyingCoupon}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    {isApplyingCoupon ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between text-white/70">
                  <span>Base Price</span>
                  <span>₹{basePrice}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-white/70">
                  <span>GST (5%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/20 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={isProcessing}
                size="lg"
                className="w-full bg-white text-charcoal hover:bg-white/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Subscribe Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-white/50 text-center mt-4">
                By subscribing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>

          {/* FAQ or Trust Badges */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-success" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-success" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-success" />
                <span>Instant access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default SubscribePage;
