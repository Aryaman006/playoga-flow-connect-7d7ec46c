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
 
     // Get user from auth header
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       throw new Error("No authorization header");
     }
 
     const token = authHeader.replace("Bearer ", "");
     const { data: { user }, error: userError } = await supabase.auth.getUser(token);
     
     if (userError || !user) {
       throw new Error("Unauthorized");
     }
 
     const { videoId } = await req.json();
 
     if (!videoId || typeof videoId !== "string") {
       throw new Error("Invalid video ID");
     }
 
     // Validate UUID format
     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
     if (!uuidRegex.test(videoId)) {
       throw new Error("Invalid video ID format");
     }
 
     // Get video duration
     const { data: video, error: videoError } = await supabase
       .from("videos")
       .select("id, duration_seconds, yogic_points")
       .eq("id", videoId)
       .single();
 
     if (videoError || !video) {
       throw new Error("Video not found");
     }
 
     if (!video.yogic_points || video.yogic_points <= 0) {
       return new Response(
         JSON.stringify({ success: true, points: 0, message: "No points for this video" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
       );
     }
 
     // Check watch progress - verify user actually watched the video
     const { data: progress, error: progressError } = await supabase
       .from("watch_progress")
       .select("watched_seconds, completed, points_awarded")
       .eq("user_id", user.id)
       .eq("video_id", videoId)
       .single();
 
     if (progressError || !progress) {
       throw new Error("No watch progress found - video must be watched first");
     }
 
     // Already awarded
     if (progress.points_awarded) {
       return new Response(
         JSON.stringify({ success: true, points: 0, message: "Points already awarded" }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
       );
     }
 
     // Verify completion - must be marked completed OR watched at least 95% of duration
     const minWatchTime = Math.floor(video.duration_seconds * 0.95);
     const hasWatchedEnough = progress.completed || progress.watched_seconds >= minWatchTime;
 
     if (!hasWatchedEnough) {
       throw new Error("Video must be completed to earn points");
     }
 
     // Award points using service role - call the RPC
     const { data: awardedPoints, error: awardError } = await supabase.rpc("award_yogic_points", {
       _user_id: user.id,
       _video_id: videoId,
     });
 
     if (awardError) {
       console.error("Error awarding points:", awardError);
       throw new Error("Failed to award points");
     }
 
     return new Response(
       JSON.stringify({
         success: true,
         points: awardedPoints || 0,
         message: awardedPoints > 0 ? `Earned ${awardedPoints} Yogic Points!` : "Points already awarded",
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
     );
   } catch (error: unknown) {
     console.error("Error awarding points:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(
       JSON.stringify({ error: errorMessage }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
     );
   }
 });