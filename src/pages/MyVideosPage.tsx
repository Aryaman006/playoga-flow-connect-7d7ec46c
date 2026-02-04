import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UserLayout } from '@/components/layout/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Play,
  Clock,
  Video,
  Crown,
  CheckCircle2,
  Loader2,
  PlayCircle,
  ListVideo,
  History,
  User,
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
    description: string | null;
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
    <div onClick={onClick} className="group cursor-pointer">
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
        {showProgress && progressPercent > 0 && !item.completed && (
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
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {showProgress && !item.completed
            ? `${Math.round(progressPercent)}% complete`
            : formatDuration(item.videos.duration_seconds)
          }
        </p>
      </div>
    </div>
  );
};

const MyVideosPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: watchData, isLoading } = useQuery({
    queryKey: ['my-videos-all', user?.id],
    queryFn: async () => {
      if (!user) return { continueWatching: [], completed: [], all: [] };
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
            is_premium,
            description
          )
        `)
        .eq('user_id', user.id)
        .order('last_watched_at', { ascending: false });
      
      if (error) throw error;
      
      const items = data as WatchProgressItem[];
      const continueWatching = items.filter(
        (item) => !item.completed && (item.watched_seconds || 0) > 0
      );
      const completed = items.filter((item) => item.completed);
      
      return { continueWatching, completed, all: items };
    },
    enabled: !!user,
  });

  const { data: stats } = useQuery({
    queryKey: ['my-videos-stats', user?.id],
    queryFn: async () => {
      if (!user) return { totalWatched: 0, totalMinutes: 0, completedCount: 0 };
      const { data, error } = await supabase
        .from('watch_progress')
        .select('watched_seconds, completed')
        .eq('user_id', user.id);
      if (error) throw error;
      const totalSeconds = data.reduce((acc, p) => acc + (p.watched_seconds || 0), 0);
      return {
        totalWatched: data.length,
        totalMinutes: Math.round(totalSeconds / 60),
        completedCount: data.filter((p) => p.completed).length,
      };
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <UserLayout>
        <div className="content-container py-16 text-center">
          <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">My Videos</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view your videos
          </p>
          <Button asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </UserLayout>
    );
  }

  if (isLoading) {
    return (
      <UserLayout>
        <div className="content-container py-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        </div>
      </UserLayout>
    );
  }

  const hasVideos = watchData?.all && watchData.all.length > 0;

  return (
    <UserLayout>
      <div className="content-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">My Videos</h1>
              <p className="text-muted-foreground">
                Track your progress and continue where you left off
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 text-center">
              <PlayCircle className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{stats?.totalWatched || 0}</p>
              <p className="text-xs text-muted-foreground">Videos Started</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">{stats?.completedCount || 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gold/5 to-gold/10 border-gold/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-gold mx-auto mb-2" />
              <p className="text-2xl font-bold text-gold">{stats?.totalMinutes || 0}</p>
              <p className="text-xs text-muted-foreground">Minutes Watched</p>
            </CardContent>
          </Card>
        </div>

        {!hasVideos ? (
          /* Empty State */
          <Card className="border-dashed border-2 bg-muted/30">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center mx-auto mb-6">
                <Play className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-3">
                Start Your Wellness Journey
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Explore our curated collection of yoga and wellness videos. Your progress will be tracked here automatically.
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-gold hover:opacity-90">
                <Link to="/browse">
                  <Play className="w-5 h-5 mr-2" />
                  Browse Videos
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Tabs */
          <Tabs defaultValue="continue" className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="continue" className="gap-2 data-[state=active]:bg-background">
                <PlayCircle className="w-4 h-4" />
                Continue Watching
                {watchData.continueWatching.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {watchData.continueWatching.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2 data-[state=active]:bg-background">
                <CheckCircle2 className="w-4 h-4" />
                Completed
                {watchData.completed.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {watchData.completed.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-background">
                <ListVideo className="w-4 h-4" />
                All Videos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="continue">
              {watchData.continueWatching.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <PlayCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No videos in progress</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start watching a video to track your progress
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/browse">Browse Videos</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {watchData.continueWatching.map((item) => (
                    <VideoCard
                      key={item.id}
                      item={item}
                      showProgress
                      onClick={() => navigate(`/video/${item.videos.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {watchData.completed.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No completed videos yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete a video to earn Yogic Points
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/browse">Browse Videos</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {watchData.completed.map((item) => (
                    <VideoCard
                      key={item.id}
                      item={item}
                      onClick={() => navigate(`/video/${item.videos.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="all">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {watchData.all.map((item) => (
                  <VideoCard
                    key={item.id}
                    item={item}
                    showProgress
                    onClick={() => navigate(`/video/${item.videos.id}`)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </UserLayout>
  );
};

export default MyVideosPage;