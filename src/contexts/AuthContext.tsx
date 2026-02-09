import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  hasActiveSubscription: boolean;
  yogicPoints: number;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  refreshYogicPoints: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This can happen during HMR or if component renders before provider mounts
    // Return a safe fallback that signals loading state
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [yogicPoints, setYogicPoints] = useState(0);

  const checkSubscriptionStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("subscriptions")
        .select("status, expires_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const isActive = data.status === "active" && (!data.expires_at || new Date(data.expires_at) > new Date());
        setHasActiveSubscription(isActive);
      }
    } catch (e) {
      console.error("Error checking subscription:", e);
    }
  };

  const fetchYogicPoints = async (userId: string) => {
    try {
      const { data } = await supabase.from("yogic_points_transactions").select("points").eq("user_id", userId);

      if (data) {
        const total = data.reduce((sum, t) => sum + t.points, 0);
        setYogicPoints(total);
      }
    } catch (e) {
      console.error("Error fetching yogic points:", e);
    }
  };

  const refreshSubscriptionStatus = async () => {
    if (user) {
      await checkSubscriptionStatus(user.id);
    }
  };

  const refreshYogicPoints = async () => {
    if (user) {
      await fetchYogicPoints(user.id);
    }
  };

  // 🔥 AUTH STATE HANDLER - Runtime only
  useEffect(() => {
    // Guard: ensure we're in browser environment
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // ✅ Ensure referral code exists for EVERY user
        try {
          await supabase.rpc("generate_referral_code", {
            _user_id: session.user.id,
          });
        } catch (e) {
          console.error("Error generating referral code:", e);
        }

        checkSubscriptionStatus(session.user.id);
        fetchYogicPoints(session.user.id);
      } else {
        setHasActiveSubscription(false);
        setYogicPoints(0);
      }

      setIsLoading(false);
    });

    // Initial session load - only after auth listener is set up
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          checkSubscriptionStatus(session.user.id);
          fetchYogicPoints(session.user.id);
        }
      } catch (e) {
        console.error("Error getting session:", e);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 🔥 SIGN UP (WITH REFERRAL PROCESSING)
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
          },
        },
      });

      if (!error && data?.user) {
        const referralCode = new URLSearchParams(window.location.search).get("ref");

        if (referralCode) {
          await supabase.rpc("process_referral", {
            _referred_user_id: data.user.id,
            _referral_code: referralCode,
          });
        }
      }

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        hasActiveSubscription,
        yogicPoints,
        signUp,
        signIn,
        signOut,
        refreshSubscriptionStatus,
        refreshYogicPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
