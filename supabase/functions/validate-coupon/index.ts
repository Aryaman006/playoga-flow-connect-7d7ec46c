 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     // Get user from auth header (optional for coupon validation)
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       throw new Error("No authorization header");
     }
 
     const token = authHeader.replace("Bearer ", "");
     const { data: { user }, error: userError } = await supabase.auth.getUser(token);
     
     if (userError || !user) {
       throw new Error("Unauthorized");
     }
 
     const { code, baseAmount } = await req.json();
 
     if (!code || typeof code !== "string") {
       throw new Error("Invalid coupon code");
     }
 
     // Validate code format - alphanumeric only, max 50 chars
     const sanitizedCode = code.trim().toUpperCase();
     if (!/^[A-Z0-9_-]{1,50}$/.test(sanitizedCode)) {
       return new Response(
         JSON.stringify({ valid: false, message: "Invalid coupon format" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
       );
     }
 
     // Query coupon with service role
     const { data: coupon, error: couponError } = await supabase
       .from("coupons")
       .select("id, discount_percentage, discount_amount, valid_from, valid_until, max_uses, uses_count")
       .eq("code", sanitizedCode)
       .eq("is_active", true)
       .single();
 
     if (couponError || !coupon) {
       return new Response(
         JSON.stringify({ valid: false, message: "Invalid coupon code" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
       );
     }
 
     // Check validity dates
     const now = new Date();
     const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
     const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
 
     if (validFrom && now < validFrom) {
       return new Response(
         JSON.stringify({ valid: false, message: "Coupon not yet active" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
       );
     }
 
     if (validUntil && now > validUntil) {
       return new Response(
         JSON.stringify({ valid: false, message: "Coupon has expired" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
       );
     }
 
     // Check usage limit
     if (coupon.max_uses && (coupon.uses_count || 0) >= coupon.max_uses) {
       return new Response(
         JSON.stringify({ valid: false, message: "Coupon usage limit reached" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
       );
     }
 
     // Calculate discount
     let discount = 0;
     const amount = typeof baseAmount === "number" ? baseAmount : 0;
     
     if (coupon.discount_amount) {
       discount = coupon.discount_amount;
     } else if (coupon.discount_percentage) {
       discount = Math.floor(amount * (coupon.discount_percentage / 100));
     }
 
     return new Response(
       JSON.stringify({
         valid: true,
         discount,
         couponId: coupon.id,
         message: `Coupon applied! ₹${discount} off`,
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
     );
   } catch (error: unknown) {
     console.error("Error validating coupon:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(
       JSON.stringify({ error: errorMessage }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
     );
   }
 });