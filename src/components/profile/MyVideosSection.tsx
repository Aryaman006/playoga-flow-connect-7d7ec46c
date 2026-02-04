import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Play,
  Clock,
  Video,
  ArrowRight,
  Crown,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface WatchProgressItem {
  id: string;
  video_id: string;
  watched_seconds: number | null;
  completed: boolean | null;
  last_watched_at: string | null;
  videos: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    duration_seconds: number;
    is_premium: boolean | null;
  };
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<{
  item: WatchProgressItem;
  showProgress?: boolean;
  onClick: () => void;
}> = ({ item, showProgress = false, onClick }) => {
  const progressPercent = item.videos.duration_seconds > 0
    ? Math.min(100, ((item.watched_seconds || 0) / item.videos.duration_seconds) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
        {item.videos.thumbnail_url ? (
          <img
            src={item.videos.thumbnail_url}
            alt={item.videos.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <Video className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-primary ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {item.videos.is_premium && (
            <Badge className="bg-gradient-to-r from-gold to-gold-light text-charcoal border-0 shadow-md">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
          {item.completed && (
            <Badge className="bg-success text-white border-0 shadow-md ml-auto">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {/* Duration */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="bg-black/70 text-white border-0 backdrop-blur-sm">
            {formatDuration(item.videos.duration_seconds)}
          </Badge>
        </div>

        {/* Progress Bar */}
        {showProgress && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {item.videos.title}
        </h4>
        {showProgress && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.round(progressPercent)}% complete
          </p>
        )}
      </div>
    </div>
  );
};

export const MyVideosSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: myVideos, isLoading } = useQuery({
    queryKey: ['my-videos', user?.id],
    queryFn: async () => {
      if (!user) return { continueWatching: [], recentlyCompleted: [] };
      const { data, error } = await supabase
        .from('watch_progress')
        .select(`
          id,
          video_id,
          watched_seconds,
          completed,
          last_watched_at,
          videos (
            id,
            title,
            thumbnail_url,
            duration_seconds,
            is_premium
          )
        `)
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      const items = data as WatchProgressItem[];
      const continueWatching = items.filter(
        (item) => !item.completed && (item.watched_seconds || 0) > 0
      ).slice(0, 4);
      const recentlyCompleted = items.filter((item) => item.completed).slice(0, 4);
      
      return { continueWatching, recentlyCompleted };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="mt-10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const hasVideos = myVideos?.continueWatching?.length || myVideos?.recentlyCompleted?.length;

  return (
    <div className="mt-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">My Videos</h2>
            <p className="text-sm text-muted-foreground">
              {hasVideos ? 'Pick up where you left off' : 'Your watch history will appear here'}
            </p>
          </div>
        </div>
        <Button variant="ghost" asChild className="hidden sm:flex">
          <Link to="/history" className="gap-2">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {!hasVideos ? (
        /* Empty State */
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Start Your Journey
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              Explore our curated collection of yoga and wellness videos to begin tracking your progress
            </p>
            <Button asChild className="bg-gradient-to-r from-primary to-gold hover:opacity-90">
              <Link to="/browse">
                <Play className="w-4 h-4 mr-2" />
                Browse Videos
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Continue Watching */}
          {myVideos?.continueWatching && myVideos.continueWatching.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <h3 className="font-semibold text-lg">Continue Watching</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {myVideos.continueWatching.map((item) => (
                  <VideoCard
                    key={item.id}
                    item={item}
                    showProgress
                    onClick={() => navigate(`/video/${item.videos.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recently Completed */}
          {myVideos?.recentlyCompleted && myVideos.recentlyCompleted.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-success" />
                <h3 className="font-semibold text-lg">Recently Completed</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {myVideos.recentlyCompleted.map((item) => (
                  <VideoCard
                    key={item.id}
                    item={item}
                    onClick={() => navigate(`/video/${item.videos.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile View All Button */}
      <Button variant="outline" asChild className="w-full mt-6 sm:hidden">
        <Link to="/history" className="gap-2">
          View All History
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
};